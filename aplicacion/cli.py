"""Comandos locales. Nunca pasar contraseñas en argumentos de terminal."""
import argparse,getpass,json,os,secrets
from pathlib import Path
from sqlalchemy import select
from .modelos import conectar,Usuario
from .seguridad import ph
from .servicio import persistir
from .importador import leer_archivo,cargar_diccionario
from .metricas import validar,serie,hallazgos,resumen_empresas

def entorno():
    p=Path('.env')
    if not p.exists():
        p.write_text('RH_SECRET='+secrets.token_hex(32)+'\nRH_HMAC_SECRET='+secrets.token_hex(32)+'\nRH_ORIGIN=http://127.0.0.1:8000\nRH_COOKIE_SECURE=0\nRH_DATABASE_URL=sqlite:///privado/rh.db\n')
        p.chmod(0o600)
    for line in p.read_text().splitlines():
        if '=' in line and not line.startswith('#'):
            k,v=line.split('=',1);os.environ.setdefault(k.strip(),v.strip())

def main():
    parser=argparse.ArgumentParser(description='Catch: herramientas del estudio')
    sub=parser.add_subparsers(dest='command',required=True)
    sub.add_parser('preparar')
    sub.add_parser('demo')
    u=sub.add_parser('usuario');u.add_argument('nombre');u.add_argument('--rol',choices=['admin','analista','cliente'],default='admin');u.add_argument('--empresa')
    imp=sub.add_parser('importar');imp.add_argument('archivo')
    perf=sub.add_parser('perfilar');perf.add_argument('archivo');perf.add_argument('--salida',default='privado/perfil')
    args=parser.parse_args();entorno()
    if args.command=='preparar':return
    if args.command=='usuario':
        if args.rol=='cliente' and not args.empresa:parser.error('Cliente requiere --empresa "COMPAÑIA n"')
        password=getpass.getpass('Contraseña (12 caracteres o más): ')
        if len(password)<12:parser.error('Contraseña demasiado corta.')
        if password!=getpass.getpass('Repite la contraseña: '):parser.error('No coinciden.')
        _,Session=conectar()
        with Session.begin() as db:
            if db.scalar(select(Usuario).where(Usuario.nombre==args.nombre)):parser.error('Usuario existente.')
            db.add(Usuario(nombre=args.nombre,hash=ph.hash(password),rol=args.rol,empresa=args.empresa))
        print('Acceso creado.');return
    if args.command=='demo':
        import hashlib
        root=Path(__file__).resolve().parents[1]
        bundles=[leer_archivo(p.read_bytes(),p.name,cargar_diccionario()) for p in sorted((root/'datos_demo').glob('*.csv'))]
        b={'huella':hashlib.sha256(''.join(x['huella'] for x in bundles).encode()).hexdigest(),'hechos':[],'incidencias':[],'perfil':[],'diccionario':{}}
        for x in bundles:
            for key in ['hechos','incidencias','perfil']:b[key]+=x[key]
            b['diccionario'].update(x['diccionario'])
        _,Session=conectar()
        with Session.begin() as db:persistir(db,b,'demo_ficticia')
        print('Estudio ficticio activado: 8 empresas, 7 bimestres.');return
    path=Path(args.archivo)
    b=leer_archivo(path.read_bytes(),path.name,cargar_diccionario())
    if args.command=='importar':
        _,Session=conectar()
        with Session.begin() as db:imp=persistir(db,b,'operador_local')
        print(f'Estudio activado: importación {imp.id}. Registros: {len(b["hechos"])}.')
    else:
        out=Path(args.salida);out.mkdir(parents=True,exist_ok=True)
        issues=validar(b['hechos']);points=serie(b['hechos'])
        from collections import Counter
        profile={'perfil':b['perfil'],'huella':b['huella'],'estados':dict(Counter(x['estado'] for x in b['hechos'])),'incidencias':dict(Counter(x['codigo'] for x in issues+b['incidencias'])),'serie':points}
        (out/'calidad.json').write_text(json.dumps(profile,ensure_ascii=False,indent=2))
        (out/'incidencias.json').write_text(json.dumps(issues+b['incidencias'],ensure_ascii=False,indent=2))
        (out/'diccionario_columnas.json').write_text(json.dumps(b['diccionario'],ensure_ascii=False,indent=2))
        (out/'modelo_largo.jsonl').write_text('\n'.join(json.dumps(f,ensure_ascii=False) for f in b['hechos']))
        lines=['# Reporte de calidad del estudio','',f'Huella SHA-256: `{b["huella"]}`','', '| Hoja | Empresas | Columnas | Filas omitidas | Valores sin encabezado |','|---|---:|---:|---:|---:|']
        lines += [f'| {p["hoja"]} | {p["empresas"]} | {p["columnas"]} | {p["filas_omitidas"]} | {p["sin_encabezado"]} |' for p in b['perfil']]
        lines+=['','## Evidencia temporal','','| Bimestre | Altas | Bajas | Balance pareado | n balance | Rotación % | n rotación |','|---|---:|---:|---:|---:|---:|---:|']
        lines += [f'| {p["bimestre"]} | {p["contrataciones"]} | {p["bajas"]} | {p["balance"]} | {p["n_balance"]} | {p["rotacion"]} | {p["n_rotacion"]} |' for p in points]
        lines+=['','## Señales para revisión','']
        for x in issues:
            if x['codigo']=='atipico_plantilla':lines.append(f'- {x["empresa"]} / {x["bimestre"]}: {x["detalle"]}')
        lines+=['','## Límites','', 'No imputación. Sin encabezado: valor omitido, no asignado por posición. No hay observaciones individuales de empleados. Valores atípicos no corregidos automáticamente. La revisión completa está en incidencias.json.']
        (out/'REPORTE_CALIDAD.md').write_text('\n'.join(lines))
        print(f'Reporte y modelo largo guardados en {out}. Contienen datos privados; no subir a Git.')

if __name__=='__main__':main()
