"""Integración opcional: no exige ni distribuye el Excel privado en CI."""
import os
from pathlib import Path
import pytest
from aplicacion.importador import leer_archivo,cargar_diccionario
from aplicacion.metricas import resumen_empresas,validar

@pytest.mark.skipif(not os.environ.get('RH_TEST_EXCEL'),reason='Archivo privado no distribuido con el repositorio')
def test_estudio_real_completo():
    p=Path(os.environ['RH_TEST_EXCEL'])
    b=leer_archivo(p.read_bytes(),p.name,cargar_diccionario())
    rows=resumen_empresas(b['hechos'])
    assert len(rows)==280
    assert len({r['bimestre'] for r in rows})==7
    assert max(r['operativos'] for r in rows if r['operativos'] is not None)>0
    assert all(c['accion']!='incluir' for c in b['diccionario'].values() if c['pregunta']=='Nombre Completo')
    assert any(x['codigo']=='atipico_plantilla' and len(x['historial'])==7 for x in validar(b['hechos']))
    assert sum(x['sin_encabezado'] for x in b['perfil'])==458
