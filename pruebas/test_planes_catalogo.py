"""Persistencia manual, aislamiento, concurrencia y cobertura del cuestionario."""
import json
from types import SimpleNamespace
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select,text,create_engine,inspect
from aplicacion.modelos import PlanVacante,EventoPlan,Hecho,Base
from aplicacion.migraciones import migrar
from aplicacion.catalogo import definiciones,cobertura
from aplicacion.importador import cargar_diccionario
from conftest import login,csv_bytes


def payload(client,**changes):
    return {'importacion':client.get('/api/filtros').json()['importacion'],'empresa':'COMPAÑIA 1','bimestre':'2025-07',
            'puesto':'Técnico de mantenimiento','plazas':3,'cubiertas':0,'fecha_objetivo':'2026-12-15',
            'notas':'Revisar experiencia en mantenimiento preventivo.',
            'acciones':[{'tarea':'Publicar vacante','area':'Reclutamiento','fecha':'2026-11-01','hecha':False}],**changes}


def test_plan_persiste_historial_y_no_altera_encuesta(client,app):
    before=client.get('/api/panel').json()
    r=client.post('/api/planes',json=payload(client));assert r.status_code==201,r.text
    p=r.json();assert p['pendientes']==3 and p['revision']==1
    body=payload(client,cubiertas=3,revision=1,notas='Proceso completado',acciones=[{'tarea':'Publicar vacante','hecha':True}])
    r=client.put(f"/api/planes/{p['id']}",json=body);assert r.status_code==200,r.text
    assert r.json()['estado']=='cubierta' and r.json()['pendientes']==0
    h=client.get(f"/api/planes/{p['id']}/historial").json()
    assert [e['revision'] for e in h]==[2,1]
    assert h[1]['datos']['cubiertas']==0 and h[0]['datos']['notas']=='Proceso completado'
    assert client.get('/api/panel').json()==before
    with app.state.Session() as db:
        assert db.scalar(select(PlanVacante)).acciones[0]['hecha']
        assert len(list(db.scalars(select(EventoPlan))))==2
    with TestClient(app) as second:
        login(second);assert second.get('/api/planes').json()['planes'][0]['revision']==2
    assert {'crear_plan','actualizar_plan'} <= {e['accion'] for e in client.get('/api/auditoria').json()}


def test_plan_concurrencia_archivo_y_filtros(client):
    p=client.post('/api/planes',json=payload(client)).json();url=f"/api/planes/{p['id']}"
    assert client.put(url,json=payload(client,revision=1,estado='archivada')).status_code==200
    assert client.get('/api/planes').json()['planes']==[]
    assert len(client.get('/api/planes?archivadas=true').json()['planes'])==1
    assert client.get('/api/planes?archivadas=true&periodos=2025-05').json()['planes']==[]
    assert client.get('/api/planes?archivadas=true&empresas=COMPAÑIA%202').json()['planes']==[]
    assert client.put(url,json=payload(client,revision=1,notas='Edición obsoleta')).status_code==409
    assert len(client.get(url+'/historial').json())==2
    assert client.put(url,json=payload(client,revision=2,estado='en_curso')).status_code==200
    assert len(client.get('/api/planes').json()['planes'])==1


def test_cliente_planes_solo_propios_y_sin_ids_ajenos(client,app):
    foreign=client.post('/api/planes',json=payload(client,empresa='COMPAÑIA 2')).json()
    with TestClient(app) as c:
        login(c,'cliente')
        assert c.get('/api/planes?empresas=COMPAÑIA%202').json()['planes']==[]
        assert c.post('/api/planes',json=payload(c,empresa='COMPAÑIA 2')).status_code==403
        own=c.post('/api/planes',json=payload(c,empresa='propia'));assert own.status_code==201,own.text
        p=own.json();assert p['empresa_id']=='propia' and p['empresa'].startswith('C-')
        assert c.get(f"/api/planes/{foreign['id']}/historial").status_code==404
        assert c.put(f"/api/planes/{foreign['id']}",json=payload(c,empresa='propia',revision=1)).status_code==404
        assert c.put(f"/api/planes/{p['id']}",json=payload(c,empresa='propia',revision=1,cubiertas=1)).status_code==200
        raw=c.get(f"/api/planes/{p['id']}/historial").text
        assert 'COMPAÑIA' not in raw
        assert len(c.get('/api/planes?empresas=COMPAÑIA%202').json()['planes'])==1


@pytest.mark.parametrize('changes',[{'plazas':0},{'cubiertas':4},{'plazas':1.5},{'estado':'cubierta'},
                                    {'fecha_objetivo':'2026-02-30'},{'acciones':[{'tarea':' '}]},
                                    {'bimestre':'2025-08'},{'empresa':'COMPAÑIA 999'}])
def test_planes_rechaza_datos_incoherentes(client,changes):
    assert client.post('/api/planes',json=payload(client,**changes)).status_code==422
    assert client.get('/api/planes').json()['planes']==[]


def test_planes_csrf_y_anonimo(client,app):
    data=payload(client);client.headers.pop('x-csrf-token')
    assert client.post('/api/planes',json=data).status_code==403
    assert client.put('/api/planes/1',json={**data,'revision':1}).status_code==403
    with TestClient(app) as c:
        for path in ['/api/planes','/api/planes/1/historial','/api/catalogo']:
            assert c.get(path).status_code==401


def test_cambio_estudio_conserva_planes_sin_mezclarlos(client,app):
    old=payload(client);p=client.post('/api/planes',json=old).json()
    preview=client.post('/api/importar/vista-previa',files={'archivo':('SEP-OCT_2025.csv',csv_bytes(),'text/csv')}).json()
    assert client.post('/api/importar/confirmar',json={'token':preview['token']}).status_code==200
    assert client.get('/api/planes?archivadas=true').json()['planes']==[]
    assert client.get(f"/api/planes/{p['id']}/historial").status_code==404
    assert client.post('/api/planes',json=old).status_code==409
    with app.state.Session() as db:assert db.scalar(select(PlanVacante)).id==p['id']


def test_catalogo_completo_etiquetas_y_columna_nueva():
    dic=cargar_diccionario();defs=definiciones(dic);by={d['metrica']:d for d in defs}
    assert len(defs)==183
    assert sum(d['columnas'] for d in defs)==len([d for d in dic.values() if d['accion']=='incluir'])
    assert by['plantilla_operativa']['tema']=='contexto'
    assert by['contrataciones_desglose']['tema']=='reclutamiento'
    assert any(s.startswith('Administrativo ·') for s in by['fuentes_uso']['dimensiones'].values())
    assert all(not s.startswith('Operativo ·') for s in by['incremento_otorgado']['dimensiones'].values())
    new={'accion':'incluir','metrica':'pregunta_nueva','pregunta':'Nueva pregunta','dimension':'total','unidad':'texto','categoria':'nuevo'}
    assert definiciones({'nueva':new})[0]['tema']=='otros'
    assert definiciones({'nueva':new})[0]['titulo']=='Nueva pregunta'


def test_catalogo_cobertura_filtrada_y_cliente(client,app):
    rows=client.get('/api/catalogo').json()['metricas'];m=next(x for x in rows if x['metrica']=='plantilla_operativa')
    assert m['numericas']==7 and m['empresas_respuesta']==7
    rows=client.get('/api/catalogo?empresas=COMPAÑIA%201').json()['metricas']
    assert next(x for x in rows if x['metrica']=='plantilla_operativa')['numericas']==1
    rows=client.get('/api/catalogo?periodos=2025-05').json()['metricas']
    assert all(x['celdas']==0 for x in rows)
    with TestClient(app) as c:
        login(c,'cliente');rows=c.get('/api/catalogo?empresas=COMPAÑIA%202').json()['metricas']
        assert next(x for x in rows if x['metrica']=='plantilla_operativa')['empresas_respuesta']==1
    with app.state.Session.begin() as db:
        f=db.scalar(select(Hecho).where(Hecho.metrica=='plantilla_operativa',Hecho.empresa=='COMPAÑIA 1'));f.excluido=True
    rows=client.get('/api/catalogo?empresas=COMPAÑIA%201').json()['metricas'];m=next(x for x in rows if x['metrica']=='plantilla_operativa')
    assert m['numericas']==0 and m['sin_valor_utilizable']==1 and m['excluidas']==1


def test_migracion_v1_aditiva_e_idempotente(tmp_path):
    engine=create_engine('sqlite:///'+str(tmp_path/'v1.db'))
    legacy=[t for t in Base.metadata.sorted_tables if t.name not in {'planes_vacantes','eventos_planes'}]
    Base.metadata.create_all(engine,tables=legacy)
    with engine.begin() as db:
        db.execute(text('CREATE TABLE version_esquema (version INTEGER PRIMARY KEY)'))
        db.execute(text('INSERT INTO version_esquema VALUES (1)'))
        db.execute(text("INSERT INTO empresas (codigo) VALUES ('COMPAÑIA 1')"))
    migrar(engine,Base);migrar(engine,Base)
    assert {'planes_vacantes','eventos_planes'}<=set(inspect(engine).get_table_names())
    with engine.begin() as db:
        assert db.scalar(text('SELECT version FROM version_esquema'))==2
        assert db.scalar(text('SELECT codigo FROM empresas'))=='COMPAÑIA 1'
        db.execute(text('UPDATE version_esquema SET version=999'))
    with pytest.raises(RuntimeError):migrar(engine,Base)
