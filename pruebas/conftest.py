import csv,io,os
import pytest
from fastapi.testclient import TestClient
from aplicacion.importador import leer_archivo
from aplicacion.modelos import Usuario
from aplicacion.servicio import persistir
from aplicacion.seguridad import ph,limites

QUESTIONS=['Compañía','Número de Empleados Actual de Personal Operativo','Número de Empleados Personal Administrativo','Capture el NÚMERO DE BAJAS','TOTAL DE CONTRATACIONES','Del total de bajas del bimestre, Desglose el número de bajas de acuerdo','Del total de bajas del bimestre, Desglose el número de bajas de acuerdo','¿Qué proporción hay de mujeres y hombres?','¿Qué proporción hay de mujeres y hombres?','Nombre Completo','Correo Electrónico','Teléfono']
DIMS=['Open-Ended Response','Open-Ended Response','Open-Ended Response','Open-Ended Response','Open-Ended Response','Renuncia Voluntaria','Abandono de Trabajo','Mujeres','Hombres','Open-Ended Response','Open-Ended Response','Open-Ended Response']

def csv_bytes(rows=None,order=None):
    rows=rows or [[f'COMPAÑIA {i}',100,20,12,15,8,4,50,50,'PERSONA PRIVADA','secreto@example.com','4421234567'] for i in range(1,8)]
    data=[QUESTIONS,DIMS]+rows
    if order:data=[[r[i] for i in order] for r in data]
    out=io.StringIO();csv.writer(out).writerows(data);return out.getvalue().encode()

@pytest.fixture
def bundle():return leer_archivo(csv_bytes(),'JUL-AGO_2025.csv')

@pytest.fixture
def app(tmp_path,monkeypatch,bundle):
    monkeypatch.setenv('RH_SECRET','s'*64);monkeypatch.setenv('RH_HMAC_SECRET','h'*64)
    monkeypatch.setenv('RH_ORIGIN','http://testserver');monkeypatch.setenv('RH_COOKIE_SECURE','0')
    limites.clear()
    from aplicacion.main import crear_app
    app=crear_app('sqlite:///'+str(tmp_path/'test.db'))
    with app.state.Session.begin() as db:
        for name,role,company in [('admin','admin',None),('analista','analista',None),('cliente','cliente','COMPAÑIA 1')]:
            db.add(Usuario(nombre=name,hash=ph.hash('prueba-segura-2026'),rol=role,empresa=company))
        persistir(db,bundle,'prueba')
    return app

def login(client,name='admin'):
    r=client.post('/api/auth/login',json={'nombre':name,'password':'prueba-segura-2026'})
    assert r.status_code==200,r.text
    client.headers['x-csrf-token']=r.json()['csrf'];return r

@pytest.fixture
def client(app):
    with TestClient(app) as c:login(c);yield c
