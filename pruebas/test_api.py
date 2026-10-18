import json
from fastapi.testclient import TestClient
from sqlalchemy import select
from aplicacion.modelos import Hecho,Usuario,Auditoria,Importacion
from conftest import login,csv_bytes

def test_sin_sesion_no_hay_datos(app):
    with TestClient(app) as c:
        for route in ['/api/panel','/api/calidad','/api/exportar','/api/reporte','/api/filtros','/api/auditoria']:
            assert c.get(route).status_code==401

def test_cookies_y_cabeceras(app):
    with TestClient(app) as c:
        r=login(c);h=r.headers.get_list('set-cookie')
        assert all('HttpOnly' in x and 'SameSite=strict' in x for x in h)
        assert "frame-ancestors 'none'" in r.headers['content-security-policy']
        assert r.headers['cache-control']=='no-store'

def test_cliente_no_elige_otra_empresa_en_servidor(app):
    with TestClient(app) as c:
        login(c,'cliente')
        r=c.get('/api/panel?empresas=COMPAÑIA%202').json()
        assert len(r['detalle'])==1 and r['detalle'][0]['empresa'].startswith('C-')
        assert r['serie'][0]['n_empresas']==1 and r['serie'][0]['plantilla']==120
        raw=c.get('/api/exportar?empresas=COMPAÑIA%202').text
        assert 'COMPAÑIA 2' not in raw and 'COMPAÑIA 1' not in raw
        e=c.get('/api/explorar?metrica=bajas').json()
        assert e['total']==1

def test_cliente_no_importa_ni_corrige(app):
    with TestClient(app) as c:
        login(c,'cliente')
        assert c.post('/api/importar/vista-previa',files={'archivo':('JUL-AGO_2025.csv',csv_bytes(),'text/csv')}).status_code==403
        assert c.post('/api/hechos/1/ajuste',json={'accion':'excluir','motivo':'Probando permisos','revision':1}).status_code==403
        assert c.get('/api/auditoria').status_code==403
        assert c.get('/api/diccionario').status_code==403

def test_csrf_y_origen(client):
    client.headers.pop('x-csrf-token')
    assert client.post('/api/auth/logout').status_code==403
    assert client.post('/api/auth/login',headers={'Origin':'https://malicioso.test'},json={'nombre':'admin','password':'prueba-segura-2026'}).status_code==403

def test_refresh_rotacion_y_logout(client):
    old=client.cookies.get('renovacion')
    assert client.post('/api/auth/refresh').status_code==200
    assert client.cookies.get('renovacion')!=old
    session=client.cookies.get('sesion')
    assert client.post('/api/auth/logout').status_code==200
    client.cookies.set('sesion',session)
    assert client.get('/api/panel').status_code==401

def test_benchmark_umbral_y_no_identidades(app):
    with TestClient(app) as c:
        login(c,'cliente')
        b=c.get('/api/benchmark?bimestre=2025-07').json()
        assert b['disponible'] and b['n_empresas']==6 and b['mediana_rotacion']==10
        assert 'COMPAÑIA' not in json.dumps(b)
        with app.state.Session.begin() as db:
            for f in db.scalars(select(Hecho).where(Hecho.empresa.in_(['COMPAÑIA 2','COMPAÑIA 3']),Hecho.metrica=='bajas')):f.excluido=True
        b=c.get('/api/benchmark?bimestre=2025-07').json()
        assert not b['disponible'] and 'n_empresas' not in b

def test_correccion_auditada_y_control_concurrencia(client,app):
    with app.state.Session() as db:id=db.scalar(select(Hecho.id).where(Hecho.empresa=='COMPAÑIA 1',Hecho.metrica=='bajas'))
    r=client.post(f'/api/hechos/{id}/ajuste',json={'accion':'corregir','valor':24,'motivo':'Confirmado contra la fuente','revision':1})
    assert r.status_code==200
    assert client.get('/api/panel?empresas=COMPAÑIA%201').json()['serie'][0]['rotacion']==20
    assert client.post(f'/api/hechos/{id}/ajuste',json={'accion':'excluir','motivo':'Revisión concurrente','revision':1}).status_code==409
    entries=client.get('/api/auditoria').json();a=next(x for x in entries if x['accion']=='ajuste')
    assert a['detalle']['antes']['valor']==12 and a['detalle']['despues']['valor']==24

def test_correccion_invalida_no_consume_revision(client,app):
    with app.state.Session() as db:id=db.scalar(select(Hecho.id).where(Hecho.metrica=='bajas'))
    assert client.post(f'/api/hechos/{id}/ajuste',json={'accion':'corregir','valor':-1,'motivo':'Valor deliberadamente inválido','revision':1}).status_code==422
    with app.state.Session() as db:assert db.scalar(select(Importacion.revision))==1

def test_preview_no_persiste_y_no_duplica(client):
    r=client.post('/api/importar/vista-previa',files={'archivo':('JUL-AGO_2025.csv',csv_bytes(),'text/csv')})
    assert r.status_code==200,r.text
    token=r.json()['token'];assert client.get('/api/panel').json()['serie'][0]['n_empresas']==7
    assert client.post('/api/importar/confirmar',json={'token':token}).status_code==409

def test_preview_confirmacion_reemplaza_estudio(client):
    r=client.post('/api/importar/vista-previa',files={'archivo':('SEP-OCT_2025.csv',csv_bytes().replace(b',15,',b',16,'),'text/csv')})
    assert r.status_code==200
    assert client.post('/api/importar/confirmar',json={'token':r.json()['token']}).status_code==200
    assert client.get('/api/filtros').json()['periodos']==['2025-09']

def test_bloqueo_intentos_fallidos(app):
    with TestClient(app) as c:
        for _ in range(5):assert c.post('/api/auth/login',json={'nombre':'admin','password':'incorrecta'}).status_code==401
        assert c.post('/api/auth/login',json={'nombre':'admin','password':'prueba-segura-2026'}).status_code==429

def test_exportacion_formulas_y_xss(client,app):
    with app.state.Session.begin() as db:
        f=db.scalar(select(Hecho));f.texto='<script>alert(1)</script>';f.dimension='=HYPERLINK("x")'
    assert "'=HYPERLINK" in client.get('/api/exportar').text
    assert '<script>alert(1)</script>' not in client.get('/api/reporte').text

def test_tipos_upload_invalidos(client):
    assert client.post('/api/importar/vista-previa',files={'archivo':('malware.xlsm',b'x','application/octet-stream')}).status_code==422
    assert client.post('/api/importar/vista-previa',files={'archivo':('malo.xlsx',b'no excel','application/octet-stream')}).status_code==422

def test_cliente_no_crea_usuario(app):
    with TestClient(app) as c:
        login(c,'cliente')
        assert c.post('/api/usuarios',json={'nombre':'intruso','password':'contraseña-larga','rol':'admin'}).status_code==403
