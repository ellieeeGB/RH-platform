"""Capa de presentación por texto y métrica; no reescribe ni imputa la fuente."""
import json,re
from pathlib import Path
from sqlalchemy import select,func,case,and_,or_
from .modelos import Hecho
from .metricas import VALIDOS
from .servicio import activa

TEMAS={
 'contexto':('Personas y empresas','Plantilla, composición, industria y ubicación.'),
 'salarios':('Salarios y desarrollo','Categorías salariales, puestos, ascensos y escolaridad.'),
 'rotacion':('Rotación y permanencia','Bajas, motivos, antigüedad y edad.'),
 'reclutamiento':('Reclutamiento y vacantes','Demanda próxima, fuentes, tiempos y candidatos.'),
 'relaciones':('Negociación y relaciones laborales','Acuerdos, incrementos, meses y relación sindical.'),
 'ausentismo':('Ausentismo y salud','Faltas, incapacidades y días perdidos.'),
 'capacitacion':('Capacitación','Horas invertidas y perfiles en desarrollo.'),
 'beneficios':('Prestaciones y costos','Cobertura, uso, apoyos, transporte, comedor y seguros.'),
 'organizacion':('Jornadas y cultura','Turnos, flexibilidad, convenios, eventos e incentivos.'),
 'seguridad':('Seguridad y contingencias','Riesgos reportados, conflictos y planes de respuesta.'),
 'otros':('Otras preguntas del estudio','Cuestionario y preguntas nuevas pendientes de clasificar.')}
RUTA=Path(__file__).resolve().parents[1]/'configuracion/presentacion_metricas.json'

def definiciones(diccionario):
    reglas=json.loads(RUTA.read_text()) if RUTA.exists() else {}
    result={}
    for c in diccionario.values():
        if c['accion']!='incluir':continue
        m=c['metrica'];cfg=reglas.get(m,{})
        theme=cfg.get('tema',c.get('categoria','otros'))
        if theme not in TEMAS:theme='otros'
        r=result.setdefault(m,{'metrica':m,'titulo':cfg.get('titulo',c['pregunta'][:160]),'tema':theme,'preguntas':[],
                              'unidades':[],'dimensiones':{},'columnas':0})
        if c['pregunta'] not in r['preguntas']:r['preguntas'].append(c['pregunta'])
        if c['unidad'] not in r['unidades']:r['unidades'].append(c['unidad'])
        label=c.get('subopcion') or c['dimension']
        if label.strip().lower() in {'open-ended response','response'}:
            label='Total reportado' if c['unidad'] not in {'texto','seleccion'} else 'Respuesta declarada'
        if re.match(r'^[0-9a-f]{8}:',c['dimension']):
            # El prefijo separa cuestionarios de distinto personal. No se elimina el contexto.
            q=c['pregunta'].lower()
            contexts=[t for t in ['operativo','técnico','administrativo','gerencial'] if t in q]
            if len(contexts)==1:label=contexts[0].capitalize()+' · '+label
            # Si la pregunta abarca varios niveles, la subopción ya identifica el nivel.
        r['dimensiones'][c['dimension']]=label
        r['columnas']+=1
    return list(result.values())

def cobertura(db,u,empresas=None,periodos=None):
    imp=activa(db)
    if not imp:return {'metricas':[],'temas':TEMAS}
    numeric=and_(Hecho.excluido.is_(False),Hecho.estado.in_(VALIDOS),Hecho.valor.is_not(None))
    texts=and_(Hecho.excluido.is_(False),Hecho.texto.is_not(None),Hecho.texto!='',~numeric)
    usable=or_(numeric,texts)
    q=select(Hecho.metrica,func.count().label('celdas'),func.sum(case((numeric,1),else_=0)).label('numericas'),
             func.sum(case((texts,1),else_=0)).label('textos'),func.count(func.distinct(case((usable,Hecho.empresa)))).label('empresas_respuesta'),
             func.count(func.distinct(Hecho.bimestre)).label('bimestres'),func.sum(case((Hecho.excluido.is_(True),1),else_=0)).label('excluidas'))
    q=q.where(Hecho.importacion_id==imp.id)
    if u.rol=='cliente':q=q.where(Hecho.empresa==u.empresa)
    elif empresas:q=q.where(Hecho.empresa.in_(empresas))
    if periodos:q=q.where(Hecho.bimestre.in_(periodos))
    stats={r.metrica:dict(r._mapping) for r in db.execute(q.group_by(Hecho.metrica))}
    entries=[]
    for d in definiciones(imp.diccionario):
        r={**d,**stats.get(d['metrica'],{'celdas':0,'numericas':0,'textos':0,'empresas_respuesta':0,'bimestres':0,'excluidas':0})}
        r['sin_valor_utilizable']=r['celdas']-r['numericas']-r['textos']
        entries.append(r)
    return {'metricas':entries,'temas':TEMAS}
