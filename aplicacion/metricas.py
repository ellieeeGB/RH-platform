"""Cálculos descriptivos. Cada total conserva su cobertura y sus componentes."""
from collections import defaultdict, Counter
import math
import statistics
import random

VALIDOS={'valido','hora_convertida','porcentaje_excel_convertido','fraccion_dia_convertida','proporcion_declarada_convertida','corregido'}

def numero(f):
    return f.get('valor') if not f.get('excluido') and f.get('estado') in VALIDOS else None

def unico(fs, metrica):
    vals=[numero(f) for f in fs if f['metrica']==metrica and f['dimension']=='total']
    return vals[0] if len(vals)==1 else None

def resumen_empresas(facts):
    groups=defaultdict(list)
    for f in facts: groups[(f['empresa'],f['bimestre'])].append(f)
    out=[]
    for (e,p), fs in sorted(groups.items()):
        op,ad=unico(fs,'plantilla_operativa'),unico(fs,'plantilla_administrativa')
        hc=op+ad if op is not None and ad is not None else None
        bajas=unico(fs,'bajas');altas=unico(fs,'contrataciones')
        out.append({'empresa':e,'bimestre':p,'operativos':op,'administrativos':ad,'plantilla':hc,'bajas':bajas,'contrataciones':altas,
            'rotacion':100*bajas/hc if bajas is not None and hc is not None and hc>0 else None,
            'n_reportes':1,'n_personas_denominador':hc,'balance':altas-bajas if altas is not None and bajas is not None else None})
    return out

def intervalo_mediana(vals):
    """Bootstrap descriptivo de empresas; no supone una muestra aleatoria del mercado."""
    if len(vals)<5:return None
    rng=random.Random(2026)
    samples=sorted(statistics.median(rng.choices(vals,k=len(vals))) for _ in range(600))
    return [samples[15],samples[584]]

def serie(facts):
    groups=defaultdict(list)
    for r in resumen_empresas(facts):groups[r['bimestre']].append(r)
    result=[]
    for p,rs in sorted(groups.items()):
        valid=[r for r in rs if r['rotacion'] is not None]
        rates=[r['rotacion'] for r in valid]
        head=[r['plantilla'] for r in rs if r['plantilla'] is not None and r['plantilla']>0]
        hires=[r['contrataciones'] for r in rs if r['contrataciones'] is not None]
        exits=[r['bajas'] for r in rs if r['bajas'] is not None]
        matched=[r for r in rs if r['balance'] is not None]
        den=sum(r['plantilla'] for r in valid)
        result.append({'bimestre':p,'n_empresas':len(rs),'n_rotacion':len(valid),'n_plantilla':len(head),'n_altas':len(hires),'n_bajas':len(exits),
            'plantilla':sum(head) if head else None,'contrataciones':sum(hires) if hires else None,'bajas':sum(exits) if exits else None,
            'balance':sum(r['balance'] for r in matched) if matched else None,'n_balance':len(matched),
            'denominador_rotacion':den if valid else None,'bajas_pareadas':sum(r['bajas'] for r in valid) if valid else None,
            'rotacion':100*sum(r['bajas'] for r in valid)/den if den else None,
            'mediana_rotacion':statistics.median(rates) if rates else None,'ic_mediana':intervalo_mediana(rates),
            'muestra_pequena':len(valid)<10})
    # Comparaciones solo entre periodos consecutivos / mismo bimestre con cohortes comunes válidas.
    index={r['bimestre']:r for r in result}
    for r in result:
        y,m=map(int,r['bimestre'].split('-'))
        prev=f'{y if m>1 else y-1}-{m-2 if m>1 else 11:02d}'
        year=f'{y-1}-{m:02d}'
        for key,other in [('anterior',prev),('interanual',year)]:
            current={x['empresa']:x for x in groups[r['bimestre']] if x['rotacion'] is not None}
            before={x['empresa']:x for x in groups.get(other,[]) if x['rotacion'] is not None}
            common=current.keys() & before.keys()
            a=100*sum(current[e]['bajas'] for e in common)/sum(current[e]['plantilla'] for e in common) if common else None
            b=100*sum(before[e]['bajas'] for e in common)/sum(before[e]['plantilla'] for e in common) if common else None
            r[key]={'bimestre':other,'n_pareadas':len(common),'cambio_pp':a-b if common else None}
    return result

def validar(facts):
    issues=[]; grouped=defaultdict(list)
    for f in facts:grouped[(f['empresa'],f['bimestre'])].append(f)
    def add(code,detail,e,p,**extra):issues.append({'codigo':code,'detalle':detail,'empresa':e,'bimestre':p,**extra})
    for (e,p),fs in grouped.items():
        hc=[unico(fs,'plantilla_operativa'),unico(fs,'plantilla_administrativa')]
        if None in hc:add('plantilla_incompleta','No se puede calcular plantilla ni rotación.',e,p)
        elif sum(hc)<=0:add('plantilla_no_positiva','Plantilla debe ser mayor que cero.',e,p)
        for met,total in [('bajas_motivo','bajas'),('bajas_mes','bajas'),('bajas_tipo','bajas'),('contrataciones_desglose','contrataciones'),('incapacidades_tipo','incapacidades')]:
            parts=[numero(f) for f in fs if f['metrica']==met]
            t=unico(fs,total)
            if not parts or t is None or None in parts:
                add('desglose_incompleto',f'{met}: no comprobable, faltan componentes o total.',e,p,metrica=met)
            elif abs(sum(parts)-t)>0.001:
                add('desglose_no_concilia',f'{met}: suma {sum(parts):g}, total {t:g}.',e,p,metrica=met)
        pct=defaultdict(list)
        for f in fs:
            if f.get('grupo_100'):pct[f['grupo_100']].append(f)
        for g,items in pct.items():
            parts=[numero(f) for f in items if 'no medimos' not in f['dimension']]
            unavailable=any((numero(f) or 0)>0 or bool(f.get('texto')) for f in items if 'no medimos' in f['dimension'])
            if unavailable or not parts or None in parts:add('porcentaje_incompleto',f'{g}: no comprobable; sin imputar faltantes.',e,p,metrica=g)
            elif abs(sum(parts)-100)>1:add('porcentaje_no_suma_100',f'{g}: suma {sum(parts):g}%; tolerancia ±1 punto.',e,p,metrica=g)
    # Atípicos transversales IQR, con comparación temporal de la misma compañía.
    rs=resumen_empresas(facts); byperiod=defaultdict(list);bycompany=defaultdict(list)
    for r in rs:
        if r['operativos'] is not None:byperiod[r['bimestre']].append(r);bycompany[r['empresa']].append(r)
    for p,rows in byperiod.items():
        vals=sorted(r['operativos'] for r in rows)
        if len(vals)<5:continue
        q1,_,q3=statistics.quantiles(vals,n=4,method='inclusive');upper=q3+3*(q3-q1)
        for r in rows:
            others=[x['operativos'] for x in bycompany[r['empresa']] if x['bimestre']!=p]
            med=statistics.median(others) if others else None
            temporal=med is not None and med>0 and (r['operativos']>med*3 or r['operativos']<med/3)
            if r['operativos']>upper or temporal:
                f=next(x for x in grouped[(r['empresa'],p)] if x['metrica']=='plantilla_operativa')
                add('atipico_plantilla',f"Operativos {r['operativos']:g}; mediana otros bimestres {med}; umbral IQR {upper:g}. Señal, no error confirmado.",r['empresa'],p,
                    hecho_id=f.get('id'),columna=f['columna'],fila=f['fila'],metrica='plantilla_operativa',historial=[{'bimestre':x['bimestre'],'valor':x['operativos']} for x in bycompany[r['empresa']]])
    return issues

def hallazgos(points):
    if not points:return []
    r=points[-1];out=[]
    if r['rotacion'] is not None:
        out.append({'titulo':'Rotación del último bimestre seleccionado','evidencia':f"{r['rotacion']:.2f}% · {r['bajas_pareadas']:g} bajas / {r['denominador_rotacion']:g} personas · n={r['n_rotacion']} empresas.",'accion':'Revisar motivos y calidad antes de decidir medidas de retención.'})
    if r['balance'] is not None:out.append({'titulo':'Balance de contratación','evidencia':f"{r['balance']:+g} contrataciones menos bajas; n={r['n_balance']} empresas con ambos datos.",'accion':'Contrastar con las vacantes próximas. El balance no equivale a cambio observado de plantilla.'})
    for key,label in [('anterior','Cambio frente al bimestre anterior'),('interanual','Comparación con el mismo bimestre del año anterior')]:
        c=r[key]
        if c['cambio_pp'] is not None:out.append({'titulo':label,'evidencia':f"{c['cambio_pp']:+.2f} puntos porcentuales; n={c['n_pareadas']} empresas comunes.",'accion':'Revisar la composición de la muestra y los valores atípicos.'})
    out.append({'titulo':'Alcance temporal','evidencia':f'{len(points)} bimestres seleccionados. Un ciclo anual no confirma estacionalidad.','accion':'Acumular más ciclos antes de ajustar modelos estacionales o atribuir causas.'})
    return out

def desglose(facts,metrica):
    groups=defaultdict(list)
    for f in facts:
        if f['metrica']==metrica:groups[f['dimension']].append(f)
    result=[]
    for d,fs in sorted(groups.items()):
        vals=[numero(f) for f in fs if numero(f) is not None]
        result.append({'dimension':d,'unidad':fs[0]['unidad'],'n_valores':len(vals),'n_empresas':len({f['empresa'] for f in fs if numero(f) is not None}),
            'n_respuestas':sum(numero(f) is not None or bool(f.get('texto') and not f.get('excluido')) for f in fs),
            'n_empresas_respuestas':len({f['empresa'] for f in fs if numero(f) is not None or (f.get('texto') and not f.get('excluido'))}),
            'mediana':statistics.median(vals) if vals else None,'suma':sum(vals) if vals else None,
            'categorias':dict(Counter(f['texto'] for f in fs if f.get('texto') and not f.get('excluido')))})
    return result

def pronostico(points):
    vals=[p['rotacion'] for p in points]
    if len(vals)<4 or any(v is None for v in vals):return {'disponible':False,'motivo':'Se requieren al menos cuatro bimestres consecutivos completos.'}
    dates=[int(p['bimestre'][:4])*12+int(p['bimestre'][5:]) for p in points]
    if any(b-a!=2 for a,b in zip(dates,dates[1:])):return {'disponible':False,'motivo':'Hay huecos temporales en la selección.'}
    errors=[b-a for a,b in zip(vals,vals[1:])]
    mae=statistics.mean(abs(e) for e in errors)
    mape=statistics.mean(abs(e/b)*100 for e,b in zip(errors,vals[1:]) if b!=0) if any(vals[1:]) else None
    return {'disponible':True,'metodo':'Persistencia: último valor; no atribuye efecto a salarios ni reclutamiento.',
        'horizonte_bimestres':3,'estimaciones':[vals[-1]]*3,'mae_backtest_pp':mae,'mape_backtest':mape,'n_backtest':len(errors),
        'advertencia':'Escenario orientativo con muestra corta; no hay suficientes errores independientes para un intervalo predictivo calibrado.'}
