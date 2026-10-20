"""Comprobaciones locales: archivos versionados, enlaces y configuración editable."""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from aplicacion.importador import cargar_diccionario
from aplicacion.catalogo import TEMAS


def main():
    tracked=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
    tracked=[p for p in tracked if p and (ROOT/p).exists()]
    errors=[]
    forbidden={'.xlsx','.xls','.db','.sqlite','.sqlite3','.log','.pyc'}
    for name in tracked:
        p=Path(name)
        if p.suffix.lower() in forbidden or name=='.env' or any(x in {'privado','node_modules','.venv','__pycache__'} for x in p.parts):
            errors.append(f'Archivo privado o generado no permitido en Git: {name}')
        if p.suffix=='.md':
            for target in re.findall(r'\]\(([^)]+)\)',(ROOT/p).read_text()):
                if re.match(r'^[a-zA-Z][\w+.-]*:',target) or target.startswith('#'):continue
                target=target.split('#')[0].split('?')[0]
                if target and not (ROOT/p.parent/target).exists():errors.append(f'Enlace local roto en {name}: {target}')
    dic=cargar_diccionario()
    presentation=json.loads((ROOT/'configuracion/presentacion_metricas.json').read_text())
    for key,value in presentation.items():
        if not isinstance(value,dict) or not value.get('titulo') or value.get('tema') not in TEMAS:
            errors.append(f'Presentación inválida: {key}')
    previews=list((ROOT/'documentacion').glob('*.html'))
    if len(previews)!=1:errors.append('Debe haber una sola vista HTML vigente en documentacion/.')
    if errors:raise SystemExit('\n'.join(errors))
    print(f'Repositorio comprobado: {len(tracked)} archivos versionados; enlaces locales válidos; {len(dic)} entradas de diccionario.')
    print('Sin Excel, bases, secretos .env ni carpetas privadas versionadas. Esto no sustituye una auditoría de secretos del historial.')


if __name__=='__main__':main()
