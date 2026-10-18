"""Empaqueta la interfaz real como vista autónoma con los CSV ficticios del repositorio."""
from pathlib import Path
import json, sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from aplicacion.importador import leer_archivo,cargar_diccionario
from aplicacion.metricas import validar
ROOT=Path(__file__).resolve().parents[1]

def main():
    hechos=[];diccionario={}
    for p in sorted((ROOT/'datos_demo').glob('*.csv')):
        b=leer_archivo(p.read_bytes(),p.name,cargar_diccionario())
        hechos.extend(b['hechos']);diccionario.update(b['diccionario'])
    # Solo demostración. No lee .env, SQLite, uploads ni directorios privados.
    for i,f in enumerate(hechos):f['id']=i+1
    keys=['id','empresa','bimestre','metrica','dimension','unidad','valor','texto','estado','excluido','hoja','fila','columna']
    data={'hechos':[{k:f.get(k) for k in keys} for f in hechos],
          'diccionario':[d for d in diccionario.values() if d['accion']=='incluir'],
          'incidencias':validar(hechos)}
    css=(ROOT/'web/estilos.css').read_text()
    s=(ROOT/'web/index.html').read_text()
    s=s.replace('<link rel="stylesheet" href="/static/estilos.css">',f'<style>{css}</style>')
    s=s.replace('<script src="/static/lectura.js" defer></script>','').replace('<script src="/static/app.js" defer></script>','')
    s=s.replace('<title>Catch · People Intelligence</title>','<title>Catch · Vista de diseño con datos ficticios</title>')
    s=s.replace('<body>','<body><div class="demo-banner">VISTA DE DISEÑO · DATOS FICTICIOS · SIN CONEXIÓN AL ESTUDIO REAL</div>')
    s=s.replace('</head>','<style>.demo-banner{padding:8px 16px;background:#f8dfb1;color:#563e19;font:700 10px/1.5 Arial,sans-serif;letter-spacing:.6px;text-align:center;position:relative;z-index:30}.shell>aside{top:31px}@media(max-width:767px){.shell>aside{top:auto}}</style></head>')
    payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    scripts='\n'.join((ROOT/'web'/p).read_text() for p in ['lectura.js','demo.js','app.js'])
    s=s.replace('</body>',f'<script>window.CATCH_DEMO={payload};\n{scripts}</script></body>')
    out=ROOT/'documentacion/vista_previa.html';out.write_text(s)
    print(f'{out.name}: {len(hechos)} registros ficticios; interfaz actual empaquetada.')

if __name__=='__main__':main()
