"""Transacciones de importación y consultas con aislamiento por empresa."""
from datetime import datetime, timezone
from sqlalchemy import select, update, insert
from .modelos import Empresa, Periodo, Importacion, Hecho, Auditoria, como_dict
from .metricas import resumen_empresas, numero, intervalo_mediana
import hashlib,hmac,os,statistics

def auditar(db, actor, accion, detalle):
    db.add(Auditoria(fecha=datetime.now(timezone.utc).isoformat(),actor=actor,accion=accion,detalle=detalle))

def persistir(db,b,actor):
    if db.scalar(select(Importacion).where(Importacion.huella==b['huella'])):
        raise ValueError('Este archivo ya fue importado. No se duplicaron registros.')
    empresas=set(db.scalars(select(Empresa.codigo)));periodos=set(db.scalars(select(Periodo.codigo)))
    for e in {f['empresa'] for f in b['hechos']}-empresas:db.add(Empresa(codigo=e))
    for p in {f['bimestre'] for f in b['hechos']}-periodos:db.add(Periodo(codigo=p))
    db.execute(update(Importacion).values(activa=False))
    imp=Importacion(huella=b['huella'],activa=True,perfil=b['perfil'],diccionario=b['diccionario'],incidencias_fuente=b['incidencias'],revision=1)
    db.add(imp);db.flush()
    for start in range(0,len(b['hechos']),2000):
        db.execute(insert(Hecho),[{**f,'importacion_id':imp.id} for f in b['hechos'][start:start+2000]])
    auditar(db,actor,'importar',{'importacion':imp.id,'huella':b['huella'],'hechos':len(b['hechos']),'reemplaza_estudio_activo':True})
    return imp

def activa(db):return db.scalar(select(Importacion).where(Importacion.activa.is_(True)))

def consulta(db,user,empresas=None,periodos=None,categoria=None,metricas=None):
    imp=activa(db)
    if not imp:return []
    q=select(Hecho).where(Hecho.importacion_id==imp.id)
    if user.rol=='cliente':q=q.where(Hecho.empresa==user.empresa)
    elif empresas:q=q.where(Hecho.empresa.in_(empresas))
    if periodos:q=q.where(Hecho.bimestre.in_(periodos))
    if categoria:q=q.where(Hecho.categoria==categoria)
    if metricas:q=q.where(Hecho.metrica.in_(metricas))
    return [como_dict(x) for x in db.scalars(q)]

def seudonimo(e):
    return 'C-'+hmac.new(os.environ['RH_HMAC_SECRET'].encode(),e.encode(),hashlib.sha256).hexdigest()[:12].upper()

def segmento(fs,dimension):
    if dimension=='tamano':
        rs=resumen_empresas(fs)
        hc=rs[0]['plantilla'] if rs else None
        return None if hc is None else ('1–250' if hc<=250 else '251–1000' if hc<=1000 else '1001+')
    found=set()
    for f in fs:
        if f['metrica']!=dimension or f['excluido']:continue
        if dimension=='tier':
            if f['texto']:found.add(f['texto'])
            elif numero(f) and numero(f)>0:found.add(f['dimension'])
        elif f['texto']:found.add(f['texto'])
    return next(iter(found)) if len(found)==1 else None

def benchmark(db,user,p,dimension='tamano'):
    """Clientes: un único grupo de pares de su propia categoría. Nunca filas de terceros."""
    imp=activa(db)
    if not imp:return {'disponible':False,'motivo':'Sin datos.'}
    facts=[como_dict(x) for x in db.scalars(select(Hecho).where(Hecho.importacion_id==imp.id,Hecho.bimestre==p,Hecho.metrica.in_(['plantilla_operativa','plantilla_administrativa','bajas','contrataciones',dimension])))]
    groups={}
    for f in facts:groups.setdefault(f['empresa'],[]).append(f)
    own=segmento(groups.get(user.empresa,[]),dimension) if user.rol=='cliente' else None
    if user.rol=='cliente' and own is None:return {'disponible':False,'motivo':'La empresa no tiene un segmento inequívoco reportado.'}
    vals=[]
    for e,fs in groups.items():
        if user.rol=='cliente' and (e==user.empresa or segmento(fs,dimension)!=own):continue
        r=resumen_empresas(fs)[0]
        if r['rotacion'] is not None:vals.append(r['rotacion'])
    if len(vals)<5:return {'disponible':False,'motivo':'Benchmark reservado: menos de 5 empresas válidas en el grupo.'}
    # No entrega extremos, lista de empresas ni cuantiles que expongan observaciones individuales.
    # Redondeo reduce precisión; k no es garantía de anonimato formal.
    interval=intervalo_mediana(vals)
    return {'disponible':True,'dimension':dimension,'grupo':own or 'Muestra completa','n_empresas':len(vals),
        'mediana_rotacion':round(statistics.median(vals),1),'intervalo_mediana':[round(x,1) for x in interval],
        'nota':'IC bootstrap descriptivo de la mediana (95%); empresas participantes, no todo el mercado.'}
