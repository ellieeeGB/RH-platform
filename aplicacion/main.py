import csv,hashlib,html,io,json,os,secrets,time
from pathlib import Path
from contextlib import asynccontextmanager
from threading import Lock
from typing import Literal
from fastapi import FastAPI,Request,Response,HTTPException,UploadFile,File,Form,Depends
from fastapi.responses import FileResponse,HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel,Field,ConfigDict
from sqlalchemy import select,update
from .modelos import conectar,Usuario,Sesion,Hecho,Importacion,Auditoria,como_dict
from .importador import leer_archivo,cargar_diccionario,limpiar,RAIZ
from .metricas import serie,resumen_empresas,validar,hallazgos,desglose,pronostico
from .servicio import activa,consulta,persistir,auditar,seudonimo,benchmark
from . import planes,catalogo
from .planes import EntradaPlan
from .seguridad import autenticar,iniciar_sesion,cookies,rol,limitar,hash_token,ph

previews={};preview_lock=Lock()

def crear_app(url=None):
    for var in ['RH_SECRET','RH_HMAC_SECRET']:
        if len(os.environ.get(var,''))<32:raise RuntimeError(f'Configure {var} con al menos 32 caracteres aleatorios.')
    engine,Session=conectar(url)
    app=FastAPI(title='Catch · Analítica de personas',docs_url=None,redoc_url=None,openapi_url=None)
    app.state.Session=Session

    def db_dep():
        with Session() as db:
            yield db
    def identity(req:Request,db=Depends(db_dep)):
        return autenticar(req,db)[0]

    @app.middleware('http')
    async def protecciones(req,call_next):
        if req.url.path.startswith('/api'):
            try:limitar('api:'+(req.client.host if req.client else 'local'),200,60)
            except HTTPException as e:return Response(e.detail,status_code=e.status_code)
            if req.method not in {'GET','HEAD','OPTIONS'}:
                origin=req.headers.get('origin')
                if origin and origin!=os.environ.get('RH_ORIGIN','http://127.0.0.1:8000'):
                    return Response('Origen no permitido.',status_code=403)
                if req.headers.get('sec-fetch-site')=='cross-site':return Response('Origen no permitido.',status_code=403)
                try:size=int(req.headers.get('content-length','0'))
                except ValueError:return Response('Tamaño inválido.',status_code=400)
                if size>16*1024*1024:return Response('Máximo 15 MB.',status_code=413)
        response=await call_next(req)
        response.headers.update({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',
          'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          'Cache-Control':'no-store','Permissions-Policy':'camera=(), microphone=(), geolocation=()'})
        if os.environ.get('RH_COOKIE_SECURE')=='1':response.headers['Strict-Transport-Security']='max-age=31536000'
        return response

    class Login(BaseModel):
        nombre:str=Field(min_length=1,max_length=100)
        password:str=Field(min_length=1,max_length=256)

    @app.post('/api/auth/login')
    def login(body:Login,req:Request,res:Response,db=Depends(db_dep)):
        u,s,refresh=iniciar_sesion(db,body.nombre,body.password,req.client.host if req.client else 'local')
        cookies(res,u,s,refresh)
        return {'rol':u.rol,'csrf':s.csrf,'nombre':u.nombre}

    @app.get('/api/me')
    def me(req:Request,db=Depends(db_dep)):
        u,s=autenticar(req,db)
        return {'rol':u.rol,'nombre':u.nombre,'empresa':seudonimo(u.empresa) if u.empresa else None,'csrf':s.csrf}

    @app.post('/api/auth/refresh')
    def refresh(req:Request,res:Response,db=Depends(db_dep)):
        raw=req.cookies.get('renovacion','');sid,_,token=raw.partition('.')
        s=db.get(Sesion,sid)
        if not s or s.vence<time.time() or not secrets.compare_digest(s.refresh_hash,hash_token(token)):
            raise HTTPException(401,'La sesión terminó.')
        if not secrets.compare_digest(req.headers.get('x-csrf-token',''),s.csrf):raise HTTPException(403,'CSRF inválido.')
        new=secrets.token_urlsafe(48);previous=s.refresh_hash
        changed=db.execute(update(Sesion).where(Sesion.id==sid,Sesion.refresh_hash==previous).values(refresh_hash=hash_token(new)))
        if changed.rowcount!=1:raise HTTPException(401,'La renovación ya fue utilizada.')
        u=db.get(Usuario,s.usuario_id);db.commit();cookies(res,u,s,new)
        return {'csrf':s.csrf}

    @app.post('/api/auth/logout')
    def logout(req:Request,res:Response,db=Depends(db_dep)):
        u,s=autenticar(req,db);db.delete(s);auditar(db,u.nombre,'logout',{});db.commit()
        res.delete_cookie('sesion',path='/');res.delete_cookie('renovacion',path='/api/auth')
        return {'ok':True}

    class NuevoUsuario(BaseModel):
        nombre:str=Field(min_length=3,max_length=100)
        password:str=Field(min_length=12,max_length=256)
        rol:Literal['admin','analista','cliente']
        empresa:str|None=None

    @app.post('/api/usuarios')
    def user_add(body:NuevoUsuario,u=Depends(identity),db=Depends(db_dep)):
        rol(u,'admin')
        if db.scalar(select(Usuario).where(Usuario.nombre==body.nombre)):raise HTTPException(409,'El usuario ya existe.')
        if body.rol=='cliente':
            codes=set(db.scalars(select(Hecho.empresa).distinct()))
            if body.empresa not in codes:raise HTTPException(422,'Seleccione una empresa importada.')
        db.add(Usuario(nombre=body.nombre,hash=ph.hash(body.password),rol=body.rol,empresa=body.empresa if body.rol=='cliente' else None))
        auditar(db,u.nombre,'crear_usuario',{'nombre':body.nombre,'rol':body.rol});db.commit();return {'ok':True}

    @app.get('/api/filtros')
    def filtros(u=Depends(identity),db=Depends(db_dep)):
        imp=activa(db)
        if not imp:return {'empresas':[],'periodos':[],'metricas':[]}
        q=select(Hecho.empresa,Hecho.bimestre).where(Hecho.importacion_id==imp.id).distinct()
        if u.rol=='cliente':q=q.where(Hecho.empresa==u.empresa)
        pairs=db.execute(q).all()
        return {'empresas':[{'id':e,'nombre':e} for e in sorted({e for e,p in pairs})] if u.rol!='cliente' else [{'id':'propia','nombre':seudonimo(u.empresa)}],
            'periodos':sorted({p for e,p in pairs}),
            'metricas':sorted((d['metrica'],d['tema']) for d in catalogo.definiciones(imp.diccionario)),
            'catalogo':catalogo.definiciones(imp.diccionario),'temas':catalogo.TEMAS,
            'etiquetas':{c['metrica']:c['pregunta'][:180] for c in imp.diccionario.values() if c['accion']=='incluir'},
            'revision':imp.revision,'importacion':imp.id}

    def filtros_lista(s):return [v for v in s.split(',') if v] if s else None

    @app.get('/api/panel')
    def panel(empresas:str='',periodos:str='',u=Depends(identity),db=Depends(db_dep)):
        fs=consulta(db,u,filtros_lista(empresas),filtros_lista(periodos),metricas=['plantilla_operativa','plantilla_administrativa','bajas','contrataciones']);points=serie(fs)
        rows=resumen_empresas(fs)
        if u.rol=='cliente':
            for r in rows:r['empresa']=seudonimo(r['empresa'])
        auditar(db,u.nombre,'ver_panel',{'empresas':filtros_lista(empresas) if u.rol!='cliente' else ['propia'],'periodos':filtros_lista(periodos)})
        db.commit()
        return {'serie':points,'detalle':rows,'hallazgos':hallazgos(points),'pronostico':pronostico(points),
            'nota':'Plantilla: foto del bimestre. Rotación: bajas / (operativos + administrativos) × 100. No suma plantillas entre periodos.'}

    @app.get('/api/benchmark')
    def pares(bimestre:str,dimension:Literal['sector','municipio','tamano','tier']='tamano',u=Depends(identity),db=Depends(db_dep)):
        r=benchmark(db,u,bimestre,dimension);auditar(db,u.nombre,'ver_benchmark',{'bimestre':bimestre,'dimension':dimension});db.commit();return r

    @app.get('/api/explorar')
    def explorar(metrica:str,empresas:str='',periodos:str='',pagina:int=1,u=Depends(identity),db=Depends(db_dep)):
        fs=consulta(db,u,filtros_lista(empresas),filtros_lista(periodos),metricas=[metrica])
        page=max(1,pagina);start=(page-1)*100
        rows=fs[start:start+100]
        if u.rol=='cliente':
            rows=[{**f,'empresa':seudonimo(f['empresa'])} for f in rows]
        imp=activa(db)
        auditar(db,u.nombre,'explorar',{'metrica':metrica,'pagina':page,'rol':u.rol});db.commit()
        return {'resumen':desglose(fs,metrica),'filas':rows,'total':len(fs),'pagina':page,
                'definiciones':[c for c in (imp.diccionario.values() if imp else []) if c['metrica']==metrica and c['accion']=='incluir']}

    @app.get('/api/calidad')
    def calidad(empresas:str='',periodos:str='',u=Depends(identity),db=Depends(db_dep)):
        fs=consulta(db,u,filtros_lista(empresas),filtros_lista(periodos));imp=activa(db)
        issues=validar(fs)
        if imp:
            visible={(f['empresa'],f['bimestre']) for f in fs}
            issues+= [x for x in imp.incidencias_fuente if (x.get('empresa'),x.get('bimestre')) in visible]
        if u.rol=='cliente':issues=[{**x,'empresa':seudonimo(x['empresa'])} if x.get('empresa') else x for x in issues]
        from collections import Counter
        issues.sort(key=lambda x:0 if x['codigo']=='atipico_plantilla' else 1)
        auditar(db,u.nombre,'ver_calidad',{'rol':u.rol});db.commit()
        return {'incidencias':issues,'conteos':dict(Counter(x['codigo'] for x in issues)),
            'estados':dict(Counter(f['estado'] for f in fs)),'revision':imp.revision if imp else 0,
            'perfil':imp.perfil if imp and u.rol!='cliente' else []}

    class Ajuste(BaseModel):
        accion:Literal['excluir','restaurar','corregir']
        valor:float|None=None
        motivo:str=Field(min_length=10,max_length=500)
        revision:int

    @app.post('/api/hechos/{id}/ajuste')
    def ajustar(id:int,body:Ajuste,u=Depends(identity),db=Depends(db_dep)):
        rol(u,'admin','analista');f=db.get(Hecho,id);imp=activa(db)
        if not f or not imp or f.importacion_id!=imp.id:raise HTTPException(404,'Registro no disponible.')
        changed=db.execute(update(Importacion).where(Importacion.id==imp.id,Importacion.revision==body.revision).values(revision=body.revision+1))
        if changed.rowcount!=1:raise HTTPException(409,'Los datos cambiaron. Recargue antes de ajustar.')
        before={'valor':f.valor,'texto':f.texto,'estado':f.estado,'excluido':f.excluido}
        if body.accion=='corregir':
            if f.estado=='encabezado_ambiguo':raise HTTPException(422,'Corrija primero el encabezado en la fuente.')
            value,txt,state=limpiar(body.valor,f.unidad)
            if value is None or state not in {'valido','fraccion_dia_convertida'}:raise HTTPException(422,'Valor inválido para la unidad.')
            f.valor=value;f.texto=None;f.estado='corregido';f.excluido=False
        else:f.excluido=body.accion=='excluir'
        after={'valor':f.valor,'texto':f.texto,'estado':f.estado,'excluido':f.excluido}
        auditar(db,u.nombre,'ajuste',{'hecho_id':id,'empresa':f.empresa,'bimestre':f.bimestre,'antes':before,'despues':after,'motivo':body.motivo,'revision':body.revision+1})
        db.commit();return {'ok':True,'revision':body.revision+1}

    @app.get('/api/auditoria')
    def bitacora(u=Depends(identity),db=Depends(db_dep)):
        rol(u,'admin','analista')
        return [como_dict(a) for a in db.scalars(select(Auditoria).order_by(Auditoria.id.desc()).limit(300))]

    @app.post('/api/importar/vista-previa')
    async def preview(archivo:UploadFile=File(...),diccionario:str=Form(''),u=Depends(identity)):
        rol(u,'admin','analista');limitar('upload:'+u.nombre,6,3600)
        data=await archivo.read(15*1024*1024+1)
        overrides=cargar_diccionario()
        if diccionario:
            try:
                edited=json.loads(diccionario)
                if not isinstance(edited,dict) or len(edited)>3000:raise ValueError()
                allowed={'metrica','dimension','unidad','grupo_100','categoria','accion'}
                for key,value in edited.items():
                    if not isinstance(value,dict):raise ValueError()
                    overrides[key]={k:v for k,v in value.items() if k in allowed and isinstance(v,str) and len(v)<500}
                    if overrides[key].get('accion') not in {None,'incluir','descartar'}:overrides[key]['accion']='descartar'
            except (ValueError,TypeError):raise HTTPException(422,'Diccionario JSON inválido.')
        try:b=leer_archivo(data,archivo.filename or '',overrides)
        except (ValueError,UnicodeError) as e:raise HTTPException(422,str(e))
        except Exception:raise HTTPException(422,'No fue posible leer el archivo. Revise formato y encabezados.')
        del data
        token=secrets.token_urlsafe(24)
        with preview_lock:
            for k in list(previews):
                if previews[k]['vence']<time.time() or previews[k]['owner']==u.id:del previews[k]
            if len(previews)>=3:raise HTTPException(429,'Hay importaciones en revisión. Intente más tarde.')
            previews[token]={'owner':u.id,'vence':time.time()+900,'bundle':b}
        from collections import Counter
        checks=validar(b['hechos'])
        return {'token':token,'perfil':b['perfil'],'hechos':len(b['hechos']),'incidencias':dict(Counter(x['codigo'] for x in checks+b['incidencias'])),
            'muestra':resumen_empresas(b['hechos'])[:8],
            'aviso':'La confirmación sustituye el estudio activo completo y conserva el historial. Los valores sin encabezado no se importan.'}

    class Confirmar(BaseModel):token:str
    @app.post('/api/importar/confirmar')
    def confirm(body:Confirmar,u=Depends(identity),db=Depends(db_dep)):
        rol(u,'admin','analista')
        with preview_lock:
            p=previews.get(body.token)
            if not p or p['owner']!=u.id or p['vence']<time.time():raise HTTPException(404,'Vista previa vencida o no disponible.')
            b=p['bundle']
            try:imp=persistir(db,b,u.nombre);db.commit()
            except ValueError as e:raise HTTPException(409,str(e))
            del previews[body.token]
        return {'ok':True,'importacion':imp.id}

    @app.get('/api/diccionario')
    def diccionario(u=Depends(identity),db=Depends(db_dep)):
        rol(u,'admin','analista');imp=activa(db)
        return Response(json.dumps(imp.diccionario if imp else cargar_diccionario(),ensure_ascii=False,indent=2),media_type='application/json',headers={'Content-Disposition':'attachment; filename="diccionario_columnas.json"'})

    @app.get('/api/exportar')
    def exportar(empresas:str='',periodos:str='',u=Depends(identity),db=Depends(db_dep)):
        fs=consulta(db,u,filtros_lista(empresas),filtros_lista(periodos));stream=io.StringIO()
        writer=csv.writer(stream);writer.writerow(['empresa','bimestre','metrica','dimension','valor','texto','estado','unidad','hoja','fila','columna','excluido'])
        def safe(v):
            t=str(v) if v is not None else ''
            return "'"+t if t.lstrip().startswith(('=','+','-','@','\t','\r')) else t
        for f in fs:
            if u.rol=='cliente':f['empresa']=seudonimo(f['empresa'])
            writer.writerow([safe(f[k]) for k in ['empresa','bimestre','metrica','dimension','valor','texto','estado','unidad','hoja','fila','columna','excluido']])
        auditar(db,u.nombre,'exportar_csv',{'filas':len(fs)});db.commit()
        return Response('\ufeff'+stream.getvalue(),media_type='text/csv',headers={'Content-Disposition':'attachment; filename="estudio_normalizado.csv"'})

    @app.get('/api/reporte',response_class=HTMLResponse)
    def reporte(empresas:str='',periodos:str='',u=Depends(identity),db=Depends(db_dep)):
        fs=consulta(db,u,filtros_lista(empresas),filtros_lista(periodos));points=serie(fs);findings=hallazgos(points)
        def esc(v):return html.escape(str(v if v is not None else 'Sin dato'))
        sections=[]
        for title,metric in [('Reclutamiento','contrataciones_desglose'),('Rotación por motivo','bajas_motivo'),('Vacantes próximas','vacantes_proximas'),('Negociaciones','negociacion_estatus'),('Capacitación','capacitacion_horas'),('Fuentes de reclutamiento','fuentes_uso'),('Beneficios','costo_transporte')]:
            entries=desglose(fs,metric)
            sections.append('<section><h2>'+esc(title)+'</h2><table><tr><th>Dimensión</th><th>Mediana</th><th>Unidad</th><th>n empresas / respuestas</th><th>Respuestas declaradas</th></tr>'+''.join(f"<tr><td>{esc(d['dimension'])}</td><td>{esc(d['mediana'])}</td><td>{esc(d['unidad'])}</td><td>{d['n_empresas_respuestas']} / {d['n_respuestas']}</td><td>{esc('; '.join(str(k)+': '+str(v) for k,v in d['categorias'].items()))}</td></tr>" for d in entries)+'</table></section>')
        body='<!doctype html><html lang="es-MX"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/static/reporte.css"><title>Reporte bimestral · Catch</title><main>'
        body+='<header><p>CATCH CONSULTING · REPORTE</p><h1>Personas, evidencia<br>y decisiones.</h1><p>'+esc(', '.join(p['bimestre'] for p in points))+'</p><p>Preparado para '+esc(seudonimo(u.empresa) if u.rol=='cliente' else 'Consultoría')+'</p></header>'
        body+='<h2>Índice</h2><p>Antecedentes · Resumen ejecutivo · Evolución · Reclutamiento · Rotación · Vacantes · Negociaciones · Capacitación · Fuentes · Beneficios · Anexo metodológico</p>'
        body+='<h2>Antecedentes</h2><p>Encuesta agregada por empresa y bimestre. Resultados descriptivos de participantes; no representan por sí solos a toda la industria.</p><h2>Resumen ejecutivo</h2>'
        body+=''.join('<article><h3>'+esc(f['titulo'])+'</h3><p>'+esc(f['evidencia'])+'</p><p>'+esc(f['accion'])+'</p></article>' for f in findings)
        body+='<h2>Evolución</h2><table><tr><th>Bimestre</th><th>Plantilla</th><th>Altas</th><th>Bajas</th><th>Rotación %</th><th>n</th></tr>'+''.join('<tr>'+''.join('<td>'+esc(p[k])+'</td>' for k in ['bimestre','plantilla','contrataciones','bajas','rotacion','n_rotacion'])+'</tr>' for p in points)+'</table>'
        body+=''.join(sections)+'<h2>Anexo metodológico</h2><p>Rotación = bajas / (plantilla operativa + administrativa reportada) × 100. Sin imputación. La plantilla no se suma entre bimestres. Las medianas de varias fechas usan observaciones empresa–bimestre, con n de empresas distinto de n de valores. Porcentajes y escalas no se suman. Los intervalos son descriptivos y no prueban causalidad. Exportar a PDF desde Imprimir → Guardar como PDF.</p><p>Incidencias de validación en esta selección: '+str(len(validar(fs)))+'</p></main></html>'
        auditar(db,u.nombre,'exportar_reporte',{'bimestres':[p['bimestre'] for p in points]});db.commit();return body

    @app.get('/api/catalogo')
    def catalogo_estudio(empresas:str='',periodos:str='',u=Depends(identity),db=Depends(db_dep)):
        return catalogo.cobertura(db,u,filtros_lista(empresas),filtros_lista(periodos))

    @app.get('/api/planes')
    def listar_planes(empresas:str='',periodos:str='',archivadas:bool=False,u=Depends(identity),db=Depends(db_dep)):
        return planes.listar(db,u,filtros_lista(empresas),filtros_lista(periodos),archivadas)

    @app.post('/api/planes',status_code=201)
    def crear_plan(body:EntradaPlan,u=Depends(identity),db=Depends(db_dep)):
        return planes.guardar(db,u,body)

    @app.put('/api/planes/{id}')
    def actualizar_plan(id:int,body:EntradaPlan,u=Depends(identity),db=Depends(db_dep)):
        return planes.guardar(db,u,body,id)

    @app.get('/api/planes/{id}/historial')
    def historia_plan(id:int,u=Depends(identity),db=Depends(db_dep)):
        return planes.historial(db,u,id)

    @app.get('/api/salud')
    def salud():return {'estado':'ok'}
    @app.get('/')
    def index():return FileResponse(RAIZ/'web/index.html')
    app.mount('/static',StaticFiles(directory=RAIZ/'web'),name='static')
    return app
