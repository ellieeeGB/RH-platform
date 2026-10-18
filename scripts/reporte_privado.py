"""Diez hallazgos reproducibles. El resultado se guarda fuera del árbol versionado."""
import sys,json,statistics
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from aplicacion.importador import leer_archivo,cargar_diccionario
from aplicacion.metricas import serie,resumen_empresas,validar,desglose
from collections import Counter

def main():
    path=Path(sys.argv[1]);b=leer_archivo(path.read_bytes(),path.name,cargar_diccionario());fs=b['hechos'];s=serie(fs);issues=validar(fs)
    last=s[-1];lastfs=[f for f in fs if f['bimestre']==last['bimestre']]
    examples=[]
    # 1: señal más extrema por tamaño absoluto, identificador preservado solo en reporte privado.
    rs=resumen_empresas(fs);peak=max((r for r in rs if r['operativos'] is not None),key=lambda r:r['operativos'])
    history=[r for r in rs if r['empresa']==peak['empresa'] and r['bimestre']!=peak['bimestre'] and r['operativos'] is not None]
    periodfacts=[dict(f) for f in fs if f['bimestre']==peak['bimestre']];before=serie(periodfacts)[0]
    for f in periodfacts:
        if f['empresa']==peak['empresa'] and f['metrica']=='plantilla_operativa':f['excluido']=True
    after=serie(periodfacts)[0]
    examples.append(('El tamaño atípico modifica la lectura de rotación',f"{peak['empresa']} declara {peak['operativos']:,.0f} operativos en {peak['bimestre']}. En otros bimestres: {min(r['operativos'] for r in history):,.0f}–{max(r['operativos'] for r in history):,.0f}. La tasa del grupo pasa de {before['rotacion']:.2f}% (n={before['n_rotacion']}) a {after['rotacion']:.2f}% (n={after['n_rotacion']}) al excluir su plantilla. Es una sensibilidad, no una corrección aplicada.",'Confirmar la fuente antes de interpretar una mejora del indicador.'))
    worst=min((p for p in s if p['balance'] is not None),key=lambda p:p['balance'])
    examples.append(('El mayor déficit de contratación aparece al cierre del año',f"{worst['bimestre']}: balance pareado de {worst['balance']:+,.0f}, con {worst['contrataciones']:,.0f} altas y {worst['bajas']:,.0f} bajas declaradas; n del balance={worst['n_balance']}.",'Planear reemplazos y revisar motivos. Un solo ciclo no demuestra estacionalidad.'))
    best=max((p for p in s if p['balance'] is not None),key=lambda p:p['balance'])
    examples.append(('La cobertura cambia el balance agregado',f"En {best['bimestre']}, restar los totales generales da {best['contrataciones']-best['bajas']:+,.0f}, pero el balance de empresas con ambos datos es {best['balance']:+,.0f} (n={best['n_balance']}). Altas tienen n={best['n_altas']} y bajas n={best['n_bajas']}.",'Usar numerador y denominador de la misma población.'))
    examples.append(('Tener 40 empresas no significa tener 40 respuestas utilizables',f"Último bimestre {last['bimestre']}: plantilla válida n={last['n_plantilla']}, rotación calculable n={last['n_rotacion']}. La tasa es {last['rotacion']:.2f}% sobre {last['denominador_rotacion']:,.0f} personas reportadas.",'Hacer visible n en toda comparación y solicitar las respuestas faltantes.'))
    annual=last['interanual']
    examples.append(('La comparación anual necesita una cohorte común',f"Cambio interanual de rotación: {annual['cambio_pp']:+.2f} puntos porcentuales, n={annual['n_pareadas']} empresas presentes con datos válidos en ambos bimestres.",'Comparar las mismas empresas. No atribuir el cambio a una intervención sin evidencia adicional.'))
    hires=desglose(lastfs,'contrataciones_desglose')
    examples.append(('Los desgloses de contratación requieren reconciliación antes de repartir porcentajes','; '.join(f"{d['dimension']}: {d['suma']:,.0f}, n={d['n_empresas']}" for d in hires if d['suma'] is not None)+f". Total general declarado: {last['contrataciones']:,.0f}, n={last['n_altas']}. Las coberturas no coinciden.",'No dibujar un pastel de nueva creación/reemplazo sobre un total incompatible. Revisar empresas con discrepancias.'))
    times=desglose(lastfs,'tiempo_contratacion')
    examples.append(('Los tiempos gerenciales contienen respuestas censuradas','; '.join(f"{d['dimension']}: mediana numérica {d['mediana']} días, n={d['n_empresas']}, intervalos/textos {d['categorias']}" for d in times), 'La mediana numérica omite intervalos como «más de 60 días» y puede subestimar la distribución. No usarla como promesa de plazo.'))
    vacancies=desglose(lastfs,'vacantes_proximas')
    examples.append(('Las vacantes próximas permiten anticipar carga de reclutamiento','; '.join(f"{d['dimension']}: {d['suma']:,.0f} plazas, mediana {d['mediana']}, n={d['n_empresas']}" for d in vacancies if d['suma'] is not None),'Separar contratación operativa de administrativa. Son planes para mes actual y siguiente, no plazas confirmadas.'))
    transport=desglose(lastfs,'costo_transporte')[0]
    sgmm=desglose(lastfs,'costo_sgmm')
    examples.append(('Las prestaciones necesitan unidades de costo distintas',f"Transporte: mediana {transport['mediana']:,.0f} MXN/persona/mes, n={transport['n_empresas']}. SGMM conserva {sum(sum(d['categorias'].values()) for d in sgmm)} respuestas en rangos/textos y {sum(d['n_valores'] for d in sgmm)} valores puntuales.",'No sumar costos por persona con pólizas anuales ni convertir rangos a puntos medios inventados.'))
    counts=Counter(x['codigo'] for x in issues+b['incidencias']);states=Counter(f['estado'] for f in fs)
    examples.append(('La calidad es una decisión de consultoría, no un detalle invisible',f"{counts['columna_sin_encabezado']} valores sin encabezado, {counts['desglose_no_concilia']} desgloses que no concilian, {states['encabezado_ambiguo']} celdas con encabezado duplicado y {states['escala_porcentaje_ambigua']} respuestas con escala porcentual ambigua.",'Resolver el cuestionario con su propietario y documentar exclusiones/correcciones.'))
    out=Path('privado/reporte_rh.md');out.parent.mkdir(exist_ok=True)
    lines=['# Catch · Revisión del estudio RH','', 'Preparado para Elliot González. Informe privado del archivo proporcionado.','',f'Huella SHA-256: `{b["huella"]}`','', '## Alcance','',f'{len(s)} bimestres, {len({f["empresa"] for f in fs})} empresas, {len(fs):,} registros normalizados. No se corrigió automáticamente ningún valor atípico.','', '## Diez hallazgos con evidencia','']
    for i,(title,evidence,action) in enumerate(examples,1):lines += [f'### {i}. {title}','',evidence,'',f'Acción sugerida: {action}','']
    lines += ['## Perfil por hoja','','| Hoja | Empresas | Columnas | Filas omitidas | Valores sin encabezado |','|---|---:|---:|---:|---:|']
    lines += [f'| {p["hoja"]} | {p["empresas"]} | {p["columnas"]} | {p["filas_omitidas"]} | {p["sin_encabezado"]} |' for p in b['perfil']]
    lines += ['','## Cobertura de rotación','','| Bimestre | Plantilla total | Plantilla pareada | Bajas pareadas | Tasa % | n empresas | IC descriptivo mediana % |','|---|---:|---:|---:|---:|---:|---|']
    lines += [f'| {p["bimestre"]} | {p["plantilla"]:,.0f} | {p["denominador_rotacion"]:,.0f} | {p["bajas_pareadas"]:,.0f} | {p["rotacion"]:.2f} | {p["n_rotacion"]} | {p["ic_mediana"][0]:.2f}–{p["ic_mediana"][1]:.2f} |' for p in s]
    lines += ['','El IC corresponde a la mediana de empresas, no a la tasa ponderada. Bootstrap descriptivo 95%, 600 remuestras, semilla 2026. La encuesta no constituye una muestra aleatoria de toda la industria.','', '## Estados de limpieza','','| Estado | Celdas |','|---|---:|']+[f'| {k} | {v:,} |' for k,v in states.most_common()]
    lines += ['','## Controles','','| Control | Incidencias |','|---|---:|']+[f'| {k} | {v:,} |' for k,v in counts.most_common()]
    lines += ['','## Límites y decisiones','', 'Rotación = bajas / (plantilla operativa + administrativa del reporte) × 100. No hay apertura/cierre verificables para un promedio. Cada comparación empareja empresas válidas. Faltantes distintos de cero. Horas y porcentajes conservan estados de conversión. Composiciones 0–1 sin formato confirmado requieren aclaración de escala.','', 'La base agregada no permite riesgos individuales, supervivencia, reingresos, brecha salarial ajustada ni causalidad. La persistencia a tres bimestres es un escenario, no un pronóstico calibrado. Solo hay un par interanual.','', 'Los nombres, correos y teléfonos se descartan durante la importación. El repositorio público no incluye este informe ni registros reales. Los resultados completos se pueden reproducir con scripts/reporte_privado.py.']
    out.write_text('\n'.join(lines));print(out)

if __name__=='__main__':main()
