"""Lecturas visuales por bimestre. Nunca suma porcentajes ni mezcla fechas/unidades."""
from collections import defaultdict, Counter
import re
import unicodedata
from .metricas import numero

UNIDADES={'porcentaje':'%','proporcion':'%','personas':'personas','eventos':'eventos',
          'horas':'h','dias':'días','escala_0_10':'/ 10','mxn_anio':'MXN / año',
          'mxn_platillo':'MXN / platillo','mxn_persona_mes':'MXN / persona / mes',
          'hora_del_dia':'h del día','numero':'','texto':'','seleccion':''}
TEXTOS={'texto','texto_no_numerico','intervalo_no_puntual'}

def numero_visual(f):
    value=numero(f)
    if value is not None:return value
    # Opciones explícitas de la escala del cuestionario; no se interpreta texto libre.
    if f.get('excluido') or f.get('estado')!='texto_no_numerico' or f.get('unidad')!='escala_0_10':return None
    text=(f.get('texto') or '').strip()
    if re.fullmatch(r'0\s*[-–]\s*No Utilizada\.?',text,re.I):return 0.0
    if re.fullmatch(r'10\s*[-–]\s*Todas mis contrataciones son por este medio\.?',text,re.I):return 10.0
    return None

def es_respuesta(f):
    return not f.get('excluido') and (numero(f) is not None or
            bool(f.get('texto') and f.get('estado') in TEXTOS))

def agrupar_categorias(groups):
    """Opciones de casilla (meses, Tier, fuentes) en un mismo gráfico y escala."""
    def key(s):return ''.join(c for c in unicodedata.normalize('NFKD',s).lower() if c.isalnum())
    simple=[g for g in groups if len(g['categorias'])==1 and not g['declaraciones'] and
            key(g['categorias'][0]['etiqueta'])==key(g['etiqueta'])]
    others=[g for g in groups if g not in simple and (g['categorias'] or g['declaraciones'])]
    if len(simple)>1:
        others.insert(0,{'etiqueta':'Opciones seleccionadas','categorias':[g['categorias'][0] for g in simple],
                         'declaraciones':[]})
    else:others=simple+others
    return others

def lectura_visual(facts, definicion, corte=None):
    """Cantidades aditivas por dimensión; promedios explícitos y cifras de origen disponibles."""
    periods=sorted({f['bimestre'] for f in facts})
    period=corte or (periods[-1] if periods else None)
    current=[f for f in facts if f['bimestre']==period]
    groups=defaultdict(list)
    for f in current:groups[(f['dimension'],f['unidad'])].append(f)
    labels=definicion.get('dimensiones',{})
    result=[]
    for (dim,unit),rows in groups.items():
        numeric=[f for f in rows if numero_visual(f) is not None]
        categorical=unit in {'texto','seleccion','hora_del_dia'}
        values=[numero_visual(f) for f in numeric] if not categorical else []
        method='suma' if unit in {'personas','eventos','horas'} else 'promedio'
        value=(sum(values) if method=='suma' else sum(values)/len(values)) if values else None
        if len(values)==1:method='exacto'
        cats=defaultdict(set)
        notes=defaultdict(set)
        for f in rows:
            if not es_respuesta(f):continue
            if categorical:
                label=f.get('texto') if f.get('texto') else str(numero(f)).removesuffix('.0')
                if unit=='hora_del_dia' and numero(f) is not None:
                    minutes=round(numero(f)*60);label=f'{minutes//60:02d}:{minutes%60:02d}'
                cats[label].add(f['empresa'])
            elif f.get('texto') and numero_visual(f) is None:notes[f['texto']].add(f['empresa'])
        def counts(items):return [{'etiqueta':k,'empresas':len(v)} for k,v in sorted(items.items(),key=lambda x:(-len(x[1]),x[0]))]
        result.append({'dimension':dim,'etiqueta':labels.get(dim,dim),'unidad':unit,
                       'simbolo':UNIDADES.get(unit,unit),'valor':value,'metodo':method,
                       'empresas':len({f['empresa'] for f in rows if es_respuesta(f)}),
                       'respuestas':sum(es_respuesta(f) for f in rows),'numericas':len(values),
                       'empresas_numericas':len({f['empresa'] for f in numeric}) if not categorical else 0,
                       'minimo':min(values) if values else None,'maximo':max(values) if values else None,
                       'categorias':counts(cats),'declaraciones':counts(notes),
                       'sin_respuesta':sum(not es_respuesta(f) for f in rows)})
    return {'bimestre':period,'periodos':periods,
            'periodos_con_respuesta':sorted({f['bimestre'] for f in facts if es_respuesta(f)}),'grupos':result,
            'graficos_texto':agrupar_categorias(result),
            'empresas':len({f['empresa'] for f in current}),
            'empresas_respuesta':len({f['empresa'] for f in current if es_respuesta(f)}),
            'respuestas':sum(es_respuesta(f) for f in current),
            'sin_respuesta':sum(not es_respuesta(f) for f in current),
            'escalas_etiquetadas':sum(numero(f) is None and numero_visual(f) is not None for f in current),
            'porcentajes_menores_a_uno':sum(f['unidad']=='porcentaje' and numero(f) is not None and 0<numero(f)<1 for f in current),
            'estados':dict(Counter(f['estado'] if not f.get('excluido') else 'excluido' for f in current))}
