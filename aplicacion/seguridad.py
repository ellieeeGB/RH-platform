import hashlib,os,secrets,time
from collections import defaultdict,deque
from threading import Lock
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError
import jwt
from fastapi import HTTPException,Request
from sqlalchemy import select
from .modelos import Usuario,Sesion
from .servicio import auditar

ph=PasswordHasher()
DUMMY=ph.hash(secrets.token_urlsafe(24))
limites=defaultdict(deque);lock=Lock()

def limitar(key,n=100,seconds=60):
    now=time.time()
    with lock:
        # Limpieza acotada para evitar crecimiento indefinido por claves/IP distintas.
        if len(limites)>5000:
            for k in list(limites):
                if not limites[k] or limites[k][-1]<now-seconds:del limites[k]
            if len(limites)>5000:raise HTTPException(429,'Servicio ocupado. Intente más tarde.')
        q=limites[key]
        while q and q[0]<now-seconds:q.popleft()
        if len(q)>=n:raise HTTPException(429,'Demasiados intentos. Espere antes de continuar.')
        q.append(now)

def hash_token(s):return hashlib.sha256(s.encode()).hexdigest()

def iniciar_sesion(db,nombre,password,ip):
    limitar('login:'+ip,10,900)
    u=db.scalar(select(Usuario).where(Usuario.nombre==nombre))
    if u and u.bloqueado_hasta>time.time():raise HTTPException(429,'Acceso temporalmente bloqueado.')
    try:valid=ph.verify(u.hash if u else DUMMY,password)
    except VerificationError:valid=False
    if not u or not valid:
        if u:
            u.fallos+=1
            if u.fallos>=5:u.bloqueado_hasta=time.time()+900
        auditar(db,nombre[:100],'login_fallido',{})
        db.commit()
        raise HTTPException(401,'Usuario o contraseña incorrectos.')
    u.fallos=0;u.bloqueado_hasta=0
    refresh=secrets.token_urlsafe(48)
    s=Sesion(id=secrets.token_hex(24),usuario_id=u.id,refresh_hash=hash_token(refresh),csrf=secrets.token_hex(24),vence=time.time()+8*3600)
    db.add(s);auditar(db,u.nombre,'login',{});db.commit()
    return u,s,refresh

def cookies(response,u,s,refresh):
    secure=os.environ.get('RH_COOKIE_SECURE')=='1'
    token=jwt.encode({'sub':str(u.id),'sid':s.id,'exp':int(time.time()+900),'iat':int(time.time()),'iss':'catch-rh','aud':'catch-rh'},os.environ['RH_SECRET'],algorithm='HS256')
    response.set_cookie('sesion',token,httponly=True,secure=secure,samesite='strict',max_age=900,path='/')
    response.set_cookie('renovacion',s.id+'.'+refresh,httponly=True,secure=secure,samesite='strict',max_age=max(0,int(s.vence-time.time())),path='/api/auth')

def autenticar(req,db,csrf=True):
    try:
        claim=jwt.decode(req.cookies.get('sesion',''),os.environ['RH_SECRET'],algorithms=['HS256'],issuer='catch-rh',audience='catch-rh',options={'require':['sub','sid','exp','iat']})
        s=db.get(Sesion,claim['sid']);u=db.get(Usuario,int(claim['sub']))
    except (jwt.PyJWTError,ValueError,KeyError):raise HTTPException(401,'Inicie sesión.')
    if not s or not u or s.usuario_id!=u.id or s.vence<time.time():raise HTTPException(401,'La sesión terminó.')
    if csrf and req.method not in {'GET','HEAD','OPTIONS'} and not secrets.compare_digest(req.headers.get('x-csrf-token',''),s.csrf):
        raise HTTPException(403,'Solicitud sin protección CSRF válida.')
    return u,s

def rol(u,*roles):
    if u.rol not in roles:raise HTTPException(403,'Su rol no permite esta operación.')
