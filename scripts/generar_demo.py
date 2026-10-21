"""Demostración ficticia reproducible. No reproduce empresas ni valores del estudio real."""
import csv,json,random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
dic=json.loads((ROOT/'configuracion/diccionario_columnas.json').read_text())
metrics=['plantilla_operativa','plantilla_administrativa','contrataciones','bajas','bajas_motivo','contrataciones_desglose','capacitacion_horas','vacantes_proximas','tiempo_contratacion','costo_transporte','genero']
cols=[c for c in dic.values() if c['metrica'] in metrics and c['accion']=='incluir']
extras=['sector','municipio','negociacion_estatus','incremento_otorgado','fuentes_uso','costo_comedor','costo_sgmm','faltas']
cols += [c for c in dic.values() if c['metrica'] in extras and c['accion']=='incluir']
rng=random.Random(2026)
for period in ['JUL-AGO_2024','SEP-OCT_2024','NOV-DIC_2024','ENE-FEB_2025','MAR-ABR_2025','MAY-JUN_2025','JUL-AGO_2025']:
    with (ROOT/'datos_demo'/f'{period}.csv').open('w',newline='') as out:
        w=csv.writer(out,lineterminator='\n');w.writerow(['Compañía']+[c['pregunta'] for c in cols]);w.writerow(['Open-Ended Response']+[c['subopcion'] for c in cols])
        for i in range(1,9):
            bajas=rng.randint(4,25);altas=rng.randint(5,30);row=[]
            for c in cols:
                m,d=c['metrica'],c['dimension'];v=0
                if m=='plantilla_operativa':v=150+i*45
                elif m=='plantilla_administrativa':v=30+i*5
                elif m=='bajas':v=bajas
                elif m=='contrataciones':v=altas
                elif m=='bajas_motivo':v=bajas if 'renuncia' in d else 0
                elif m=='contrataciones_desglose':v=altas if 'reemplazo' in d else 0
                elif m=='genero':v=50
                elif m=='tiempo_contratacion':v=rng.randint(5,30)
                elif m=='costo_transporte':v=rng.randint(500,1600)
                elif m=='sector':v='Manufactura' if i%2 else 'Servicios industriales'
                elif m=='municipio':v='Municipio demo '+str(i%3+1)
                elif m=='negociacion_estatus':v=('Revisión realizada' if i%3 else 'Pendiente de negociación') if d=='total' else ''
                elif m=='incremento_otorgado':v=4+i/2 if c['unidad']=='porcentaje' else ''
                elif m=='fuentes_uso':v=(i+len(d))%11
                elif m=='costo_comedor':v=35+i*2
                elif m=='costo_sgmm':v=8000+i*500
                elif m=='faltas':v=2+i
                else:v=rng.randint(1,60)
                row.append(v)
            w.writerow([f'COMPAÑIA {i}']+row)
print('CSV ficticios generados con semilla 2026.')
