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

@pytest.mark.skipif(not os.environ.get('RH_TEST_EXCEL'),reason='Archivo privado no distribuido con el repositorio')
def test_excel_real_por_api_hasta_reporte_y_ajuste(client,app):
    """Usa la misma API de la página y una base temporal; nunca modifica la base privada."""
    from sqlalchemy import select
    from aplicacion.modelos import Hecho
    path=Path(os.environ['RH_TEST_EXCEL'])
    initial=client.get('/api/filtros').json()['importacion']
    response=client.post('/api/importar/vista-previa',files={'archivo':(path.name,path.read_bytes())})
    assert response.status_code==200
    preview=response.json();assert len(preview['perfil'])==7
    assert client.get('/api/filtros').json()['importacion']==initial
    assert client.post('/api/importar/confirmar',json={'token':preview['token']}).status_code==200
    filters=client.get('/api/filtros').json();assert len(filters['empresas'])==40 and len(filters['periodos'])==7
    panel=client.get('/api/panel').json();assert len(panel['detalle'])==280
    catalog=client.get('/api/catalogo').json()['metricas'];assert len(catalog)==183
    assert sum(x['celdas'] for x in catalog)==preview['hechos']
    # Una consulta por tema valida la ruta común del explorador sin generar centenares de peticiones.
    selected={d['tema']:d['metrica'] for d in catalog if d['numericas']+d['textos']>0}
    for metric in selected.values():
        result=client.get('/api/explorar',params={'metrica':metric})
        assert result.status_code==200 and result.json()['total']>0
    quality=client.get('/api/calidad').json()
    peak=max(panel['detalle'],key=lambda r:r['operativos'] or 0)
    outlier=next(i for i in quality['incidencias'] if i['codigo']=='atipico_plantilla' and i['empresa']==peak['empresa'] and i['bimestre']==peak['bimestre'])
    scope={'empresas':peak['empresa'],'periodos':peak['bimestre']}
    assert len(outlier['historial'])==7
    focused=client.get('/api/calidad',params=scope).json()
    assert any(x['codigo']=='atipico_plantilla' and len(x['historial'])==7 for x in focused['incidencias'])
    assert client.get('/api/reporte',params={'empresas':'COMPAÑIA 1'}).status_code==200
    assert client.get('/api/exportar',params={'empresas':'COMPAÑIA 1','periodos':'2025-07'}).status_code==200
    with app.state.Session() as db:
        fact=db.scalar(select(Hecho).where(Hecho.id==outlier['hecho_id']))
        original=fact.valor
        assert original>0 and not fact.excluido
    changed=client.post(f"/api/hechos/{outlier['hecho_id']}/ajuste",json={'accion':'excluir','motivo':'Prueba temporal de sensibilidad, sin modificar la base original.','revision':quality['revision']})
    assert changed.status_code==200
    detail=client.get('/api/panel',params=scope).json()['detalle'][0]
    assert detail['rotacion'] is None
    restored=client.post(f"/api/hechos/{outlier['hecho_id']}/ajuste",json={'accion':'restaurar','motivo':'Fin de la prueba temporal de exclusión.','revision':changed.json()['revision']})
    assert restored.status_code==200
    assert client.get('/api/panel',params=scope).json()['detalle'][0]['operativos']==original
