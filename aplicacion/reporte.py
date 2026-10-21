"""Reporte HTML autónomo, imprimible y sin JavaScript ni recursos externos."""
import base64
import html
from pathlib import Path
from collections import defaultdict
from .metricas import serie, numero
from .catalogo import definiciones
from .presentacion import lectura_visual, numero_visual, UNIDADES

ROOT=Path(__file__).resolve().parents[1]

def esc(value):return html.escape(str(value if value is not None else 'Sin respuesta'))
def fmt(value):return f'{value:,.2f}'.rstrip('0').rstrip('.') if isinstance(value,(int,float)) else 'Sin respuesta válida'
def valor(value,unit,exacto=False):return (f'{value:,}'.removesuffix('.0') if exacto and isinstance(value,(int,float)) else fmt(value))+(' '+UNIDADES.get(unit,unit) if value is not None and UNIDADES.get(unit,unit) else '')
def periodo(p):
    return {'01':'Ene–Feb','03':'Mar–Abr','05':'May–Jun','07':'Jul–Ago','09':'Sep–Oct','11':'Nov–Dic'}.get(p[5:],p)+' '+p[:4]
def tabla(headers,rows):
    return '<table><thead><tr>'+''.join('<th scope="col">'+esc(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+esc(c)+'</td>' for c in row)+'</tr>' for row in rows)+'</tbody></table>'
def barras(rows,unit,exacto=False):
    if not rows:return '<p class="empty">Sin respuestas válidas en este bimestre.</p>'
    maximum=max(100 if unit=='porcentaje' else 10 if unit=='escala_0_10' else 1,max(abs(v) for _,v,_ in rows))
    return '<div class="report-bars">'+''.join('<div class="bar-row"><div><span>'+esc(label)+'</span><strong>'+esc(valor(v,unit,exacto))+'</strong></div><svg viewBox="0 0 600 12" preserveAspectRatio="none" aria-hidden="true"><rect width="600" height="12" rx="4" fill="#edf1f3"/><rect width="'+str(max(0,abs(v)/maximum*600))+'" height="12" rx="4" fill="#087c88"/></svg><small>'+esc(note)+'</small></div>' for label,v,note in rows)+'</div>'

def curva(points):
    valid=[p for p in points if p['rotacion'] is not None]
    if not valid:return '<p class="empty">Sin plantilla y bajas completas para dibujar la evolución.</p>'
    high=max(1,max(p['rotacion'] for p in valid)*1.15);width,height,left,top=760,250,95,25
    x=lambda i:left+(610/2 if len(points)==1 else i*610/(len(points)-1))
    y=lambda v:height-55-v/high*165
    s='<svg class="evolution" viewBox="0 0 760 250" role="img" aria-label="Rotación bimestral en porcentaje; valores en la tabla siguiente">'
    for i in range(5):
        v=high*i/4;s+=f'<line x1="95" x2="725" y1="{y(v)}" y2="{y(v)}" stroke="#dae4e7"/><text x="85" y="{y(v)+4}" text-anchor="end">{fmt(v)} %</text>'
    segment=[]
    for i,p in enumerate(points):
        if p['rotacion'] is None:
            if segment:s+='<polyline fill="none" stroke="#087c88" stroke-width="3" points="'+' '.join(segment)+'"/>';segment=[]
        else:segment.append(f'{x(i)},{y(p["rotacion"])}')
    if segment:s+='<polyline fill="none" stroke="#087c88" stroke-width="3" points="'+' '.join(segment)+'"/>'
    for i,p in enumerate(points):
        if p['rotacion'] is not None:s+=f'<circle cx="{x(i)}" cy="{y(p["rotacion"])}" r="4" fill="#087c88"/>'
        s+=f'<text x="{x(i)}" y="225" text-anchor="middle">{esc(periodo(p["bimestre"])[:7])}</text><text x="{x(i)}" y="242" text-anchor="middle">{p["bimestre"][:4]}</text>'
    return s+'</svg>'

CHAPTERS=[
 ('Personas y contexto','Plantilla y perfil de las empresas participantes.',['plantilla_operativa','plantilla_administrativa','genero','sector','municipio','tier']),
 ('Contrataciones y vacantes','Entradas del bimestre y demanda próxima declarada.',['contrataciones_desglose','vacantes_proximas','tiempo_contratacion']),
 ('Rotación y permanencia','Motivos, antigüedad y edad de las bajas.',['bajas_motivo','bajas_antiguedad','bajas_edad']),
 ('Negociación colectiva','Situación de los acuerdos, incrementos y calendario.',['negociacion_estatus','incremento_otorgado','incremento_planeado','incremento_meses','incremento_meses_previstos']),
 ('Ausentismo y salud','Faltas e incapacidades reportadas.',['faltas','incapacidades','incapacidades_tipo']),
 ('Capacitación','Horas de formación por tipo de personal.',['capacitacion_horas']),
 ('Fuentes de reclutamiento','Canales seleccionados y valoración de uso.',['fuentes_uso','fuentes_seleccion']),
 ('Prestaciones al personal y sus costos','Transporte, alimentación y seguro de gastos médicos mayores (SGMM). Los importes tienen distintas bases de cobro.',['costo_transporte','costo_comedor','costo_sgmm'])]

def bloque_metrica(fs,definition,corte):
    metric=definition['metrica'];facts=[f for f in fs if f['metrica']==metric]
    reading=lectura_visual(facts,definition,corte)
    s='<article class="metric-block"><h3>'+esc(definition['titulo'])+'</h3>'
    s+='<p class="coverage">'+str(reading['empresas_respuesta'])+' empresas con respuesta · '+str(reading['respuestas'])+' respuestas · '+str(reading['sin_respuesta'])+' celdas sin respuesta válida.</p>'
    if reading['escalas_etiquetadas']:s+='<p class="coverage">Se interpretan las opciones explícitas «0 - No Utilizada» como 0 y «10 - Todas mis contrataciones son por este medio» como 10; el texto original se conserva en la exportación.</p>'
    if reading['porcentajes_menores_a_uno']:s+='<p class="scale-note">Hay porcentajes inferiores al 1%. Confirma su escala con quien elaboró el estudio antes de comparar. Se conservan los valores originales.</p>'
    if not reading['respuestas']:return s+'<p class="empty">Sin respuestas válidas en '+esc(periodo(corte))+'. No significa cero ni ausencia de esta prestación o actividad.</p></article>'
    units=defaultdict(list)
    for g in reading['grupos']:
        if g['valor'] is not None:units[g['unidad']].append(g)
    for unit,groups in units.items():
        groups.sort(key=lambda g:g['valor'],reverse=True)
        method='Total reportado' if unit in {'personas','eventos','horas'} else ('Valor reportado' if all(g['numericas']==1 for g in groups) else 'Promedio de las respuestas válidas')
        s+='<div class="chart-reading"><div><h4>'+method+'</h4>'+barras([(g['etiqueta'],g['valor'],f"{g['numericas']} respuestas de {g['empresas_numericas']} empresas") for g in groups[:8]],unit,all(g['metodo']=='exacto' for g in groups))+'</div><aside><h4>Lectura del gráfico</h4><p>'+esc(groups[0]['etiqueta'])+' presenta '+esc(valor(groups[0]['valor'],unit))+'.</p><p>'
        s+=('Se suman cantidades del mismo bimestre por opción. Las coberturas pueden variar; las categorías no siempre son excluyentes.' if method=='Total reportado' else 'Cada opción tiene una sola respuesta válida: se muestra el valor reportado, sin promediarlo.' if method=='Valor reportado' else 'Se muestra el promedio por respuesta. No se suman porcentajes, escalas ni costos por persona. Consulta abajo los importes exactos reportados.')+'</p>'
        if any(g['empresas']<5 for g in groups):s+='<p>Muestra pequeña: menos de 5 empresas en alguna opción.</p>'
        s+='</aside></div>'
        if len(groups)>8:s+='<p>Gráfico con las 8 opciones de mayor valor, de '+str(len(groups))+' disponibles.</p><details class="exact-values"><summary>Ver todas las opciones y sus cifras · abre para incluirlas al imprimir</summary>'+tabla(['Opción','Resultado','Empresas'],[(g['etiqueta'],valor(g['valor'],unit,g['metodo']=='exacto'),g['empresas_numericas']) for g in groups])+'</details>'
        if any(g['metodo']=='promedio' for g in groups):
            rows=[f for f in facts if f['bimestre']==corte and f['unidad']==unit and numero_visual(f) is not None]
            s+='<details class="exact-values"><summary>Valores exactos por empresa · abre este detalle para incluirlo al imprimir</summary>'+tabla(['Empresa','Opción','Valor reportado'],[(f['empresa'],definition.get('dimensiones',{}).get(f['dimension'],f['dimension']),valor(numero_visual(f),unit,True)) for f in rows])+'</details>'
    for g in reading['graficos_texto']:
        for key in ['categorias','declaraciones']:
            cats=g[key]
            if not cats:continue
            s+='<div class="chart-reading"><div><h4>'+esc('Respuestas declaradas' if g['etiqueta']=='total' else g['etiqueta'])+'</h4>'+barras([(c['etiqueta'],c['empresas'],'') for c in cats[:12]],'')+'</div><aside><h4>Qué significa</h4><p>Las barras cuentan empresas que declararon cada respuesta en este bimestre.</p><p>'+('Son categorías, no valores faltantes. Una selección múltiple puede sumar más que el total de empresas.' if key=='categorias' else 'Los intervalos y las declaraciones no numéricas se conservan sin convertirlos en cifras puntuales.')+'</p></aside></div>'
            if len(cats)>12:s+='<p>Gráfico con 12 de '+str(len(cats))+' respuestas. Listado completo:</p>'+tabla(['Respuesta','Empresas'],[(c['etiqueta'],c['empresas']) for c in cats])
    return s+'</article>'

def generar(fs,diccionario,destinatario,periodos=None):
    points=serie(fs);dates=sorted(periodos or {f['bimestre'] for f in fs});corte=dates[-1] if dates else None
    defs={d['metrica']:d for d in definiciones(diccionario)}
    style=(ROOT/'web/reporte.css').read_text();logo=base64.b64encode((ROOT/'web/recursos/catch-consulting.png').read_bytes()).decode()
    chapters=[('Resumen del bimestre',''),('Evolución','')]+[(title,desc) for title,desc,_ in CHAPTERS]+[('Alcance y metodología','')]
    s='<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reporte visual · Catch Consulting</title><style>'+style+'</style></head><body><main>'
    s+='<header><img class="report-logo" alt="Catch Consulting" src="data:image/png;base64,'+logo+'"><div><p class="eyebrow">ESTUDIO BIMESTRAL DE RECURSOS HUMANOS</p><h1>Personas y decisiones.</h1><p>'+esc(periodo(corte) if corte else 'Sin datos')+' · '+esc(destinatario)+'</p></div></header>'
    s+='<p class="print-help">Reporte autónomo · Para guardar un PDF: Imprimir → Guardar como PDF.</p><nav class="report-index" aria-label="Índice"><h2>Índice</h2><ol>'+''.join(f'<li><a href="#capitulo-{i}">{esc(title)}</a></li>' for i,(title,_) in enumerate(chapters,1))+'</ol></nav>'
    p=next((x for x in points if x['bimestre']==corte),None)
    s+='<section id="capitulo-1"><h2><span>01</span> Resumen del bimestre</h2><p>Lectura de '+esc(periodo(corte) if corte else 'la selección')+'. Los gráficos temáticos usan este bimestre; la evolución conserva las fechas seleccionadas.</p>'
    if p:
        s+='<div class="report-kpis">'+''.join('<article><span>'+label+'</span><strong>'+esc(value)+'</strong><small>'+str(n)+' empresas con datos</small></article>' for label,value,n in [('Plantilla',valor(p['plantilla'],'personas'),p['n_plantilla']),('Rotación',valor(p['rotacion'],'porcentaje'),p['n_rotacion']),('Contrataciones',fmt(p['contrataciones']),p['n_altas']),('Bajas',fmt(p['bajas']),p['n_bajas'])])+'</div>'
        s+='<p>Rotación: '+fmt(p['bajas_pareadas'])+' bajas entre '+fmt(p['denominador_rotacion'])+' personas de las mismas '+str(p['n_rotacion'])+' empresas. Plantilla reportada, sin imputación.</p>'
        s+='<div class="callout"><strong>Balance de contratación: '+fmt(p['balance'])+' personas.</strong><p>Contrataciones menos bajas en '+str(p['n_balance'])+' empresas con ambos datos. No equivale al cambio observado de plantilla.</p></div>'
    else:s+='<p class="empty">No hay indicadores calculables en el bimestre seleccionado.</p>'
    s+='</section><section id="capitulo-2"><h2><span>02</span> Evolución</h2>'+curva(points)+'<p>Rotación calculada con las empresas válidas de cada bimestre. La cobertura puede cambiar; la tabla muestra cuántas empresas participan. Una subida o bajada no demuestra una causa ni confirma estacionalidad.</p>'
    s+=tabla(['Bimestre','Plantilla','Contrataciones','Bajas','Rotación','Empresas con tasa'],[(periodo(p['bimestre']),fmt(p['plantilla']),fmt(p['contrataciones']),fmt(p['bajas']),valor(p['rotacion'],'porcentaje'),p['n_rotacion']) for p in points])+'</section>'
    for i,(title,desc,metrics) in enumerate(CHAPTERS,3):
        s+=f'<section id="capitulo-{i}"><h2><span>{i:02d}</span> {esc(title)}</h2><p>{esc(desc)}</p>'
        available=[m for m in metrics if m in defs]
        s+=''.join(bloque_metrica(fs,defs[m],corte) for m in available) if available else '<p class="empty">Estas preguntas no están presentes en el estudio cargado.</p>'
        s+='</section>'
    s+='<section id="capitulo-11"><h2><span>11</span> Alcance y metodología</h2><ul><li>La muestra corresponde a las empresas participantes, no a toda la industria.</li><li>En este reporte se escribe «empresas» y «respuestas» en lugar de «n». Si aparece n en un archivo de origen, significa el número de observaciones; siempre debe indicarse qué se cuenta.</li><li>Rotación = bajas / (plantilla operativa + administrativa reportada) × 100. Se usa la plantilla del reporte porque no hay una medición homogénea de apertura y cierre para todas las empresas.</li><li>Las cantidades se suman por opción dentro del bimestre. Los porcentajes, costos por persona y escalas usan promedios explícitos; con una sola respuesta se muestra el valor exacto.</li><li>No se suman plantillas ni vacantes de fechas distintas. No se imputan faltantes ni se convierten intervalos en valores puntuales.</li><li>Las cifras pueden incluir atípicos aún no excluidos; la revisión y las correcciones se realizan en Calidad de datos con bitácora.</li><li>Con siete bimestres hay evidencia insuficiente para confirmar patrones estacionales. Las comparaciones descriptivas no identifican causas.</li><li>Este reporte resume los temas indicados en el índice. Todas las preguntas, incluidas salarios, jornadas y riesgos, permanecen disponibles en Todo el estudio y en la exportación CSV autorizada.</li></ul></section>'
    return s+'<footer>Catch Consulting · Reporte generado con los filtros autorizados. Conserva este archivo de forma privada.</footer></main></body></html>'
