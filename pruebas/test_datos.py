import json,io,csv,math
from copy import deepcopy
import pytest
from aplicacion.importador import limpiar,columnas,leer_archivo,periodo
from aplicacion.metricas import resumen_empresas,serie,validar,pronostico
from conftest import csv_bytes,QUESTIONS,DIMS

@pytest.mark.parametrize('raw,state',[('N/A','no_aplica'),('Desconocido','desconocido'),('Por definir','por_definir'),('-','sin_respuesta'),(None,'vacio')])
def test_faltantes_no_son_cero(raw,state):assert limpiar(raw,'personas')==(None,None,state)

@pytest.mark.parametrize('raw',[0,0.0,'0'])
def test_cero_real(raw):assert limpiar(raw,'personas')[0]==0

def test_intervalo_no_se_inventa_punto():
    v,t,s=limpiar('más del 15%','porcentaje');assert v is None and t=='más del 15%' and s=='intervalo_no_puntual'

def test_rango_monetario_no_se_convierte_a_promedio():
    assert limpiar('entre $500,000.01 y $600,000.00 MXN','mxn_anio')[2]=='intervalo_no_puntual'

def test_escala_ambigua_requiere_diccionario_explicito():
    row=['COMPAÑIA 1',100,20,12,15,8,4,.3,.7,'','','']
    b=leer_archivo(csv_bytes([row]),'JUL-AGO_2025.csv')
    assert all(f['valor'] is None and f['estado']=='escala_porcentaje_ambigua' for f in b['hechos'] if f['metrica']=='genero')
    overrides={c['clave']:{'unidad':'proporcion'} for c in columnas(QUESTIONS,DIMS) if c.get('metrica')=='genero'}
    b=leer_archivo(csv_bytes([row]),'JUL-AGO_2025.csv',overrides)
    assert sorted(f['valor'] for f in b['hechos'] if f['metrica']=='genero')==[30,70]

@pytest.mark.parametrize('raw,unit,format,expected',[(.5,'hora_del_dia','General',12),(12,'hora_del_dia','General',12),(.5,'horas','General',.5),(.5,'horas','[h]:mm',12),(.15,'porcentaje','0%',15),(.15,'porcentaje','General',.15)])
def test_unidades_no_por_magnitud(raw,unit,format,expected):assert limpiar(raw,unit,format)[0]==expected

@pytest.mark.parametrize('raw,unit',[(101,'porcentaje'),(-1,'personas'),(1.5,'personas'),(11,'escala_0_10'),(float('inf'),'numero')])
def test_invalido_no_participa(raw,unit):assert limpiar(raw,unit)[0] is None

@pytest.mark.parametrize('raw',['=HYPERLINK("x")','@SUM(1)','+cmd','secreto@example.com','442 123 4567'])
def test_pii_y_formula_no_se_persisten(raw):
    v,t,s=limpiar(raw,'texto');assert v is None and t is None

def test_mapeo_invariante_ante_reordenacion():
    a=leer_archivo(csv_bytes(),'JUL-AGO_2025.csv')
    b=leer_archivo(csv_bytes(order=list(reversed(range(len(QUESTIONS))))),'JUL-AGO_2025.csv')
    def projection(x):return sorted((f['empresa'],f['clave'],f['metrica'],f['dimension'],f['valor']) for f in x['hechos'])
    assert projection(a)==projection(b)

def test_privacidad_incluso_con_diccionario_malicioso():
    cols=columnas(QUESTIONS,DIMS)
    overrides={c['clave']:{'accion':'incluir'} for c in cols if c['accion']=='descartar_pii'}
    b=leer_archivo(csv_bytes(),'JUL-AGO_2025.csv',overrides)
    text=json.dumps(b['hechos'])
    assert 'PERSONA PRIVADA' not in text and 'secreto@example.com' not in text and '4421234567' not in text

def test_duplicados_de_encabezado_no_se_suman():
    cs=columnas(['TOTAL DE CONTRATACIONES','TOTAL DE CONTRATACIONES'],['Open-Ended Response']*2)
    assert all(c['duplicada'] for c in cs)

def test_columna_nueva_con_texto_se_conserva():
    cs=columnas(['Pregunta nueva no vista'],['Una opción'])
    assert cs[0]['accion']=='incluir' and cs[0]['metrica'].startswith('pregunta_')

def test_sin_encabezado_no_hereda_pregunta_anterior():
    cs=columnas(['TOTAL DE CONTRATACIONES',None],['Open-Ended Response',None])
    assert cs[1]['accion']=='sin_encabezado'

def test_llave_empresa_bimestre_repetida_rechazada():
    row=['COMPAÑIA 1',100,20,12,15,8,4,50,50,'','','']
    with pytest.raises(ValueError,match='duplicados'):leer_archivo(csv_bytes([row,row]),'JUL-AGO_2025.csv')

def test_formula_rotacion_calculada_a_mano(bundle):
    r=resumen_empresas(bundle['hechos'])[0]
    assert r['plantilla']==120 and r['bajas']==12 and r['rotacion']==10
    s=serie(bundle['hechos'])[0]
    assert s['plantilla']==840 and s['bajas_pareadas']==84 and s['rotacion']==10 and s['n_rotacion']==7

def test_denominador_pareado_excluye_empresa_sin_bajas(bundle):
    for f in bundle['hechos']:
        if f['empresa']=='COMPAÑIA 1' and f['metrica']=='bajas':f['valor']=None;f['estado']='vacio'
    s=serie(bundle['hechos'])[0]
    assert s['n_plantilla']==7 and s['n_rotacion']==6 and s['denominador_rotacion']==720

def test_cero_plantilla_no_divide(bundle):
    for f in bundle['hechos']:
        if f['metrica'].startswith('plantilla'):f['valor']=0
    assert serie(bundle['hechos'])[0]['rotacion'] is None
    assert any(x['codigo']=='plantilla_no_positiva' for x in validar(bundle['hechos']))

def test_reconciliacion_detecta_suma_incorrecta(bundle):
    assert not any(x['codigo']=='desglose_no_concilia' for x in validar(bundle['hechos']))
    for f in bundle['hechos']:
        if f['metrica']=='bajas_motivo' and 'renuncia' in f['dimension']:f['valor']=9
    assert sum(x['codigo']=='desglose_no_concilia' for x in validar(bundle['hechos']))==7

def test_porcentajes_completos_y_faltantes_distintos(bundle):
    assert not any(x['codigo']=='porcentaje_no_suma_100' for x in validar(bundle['hechos']))
    for f in bundle['hechos']:
        if f['metrica']=='genero' and f['dimension']=='mujeres':f['valor']=70
    assert sum(x['codigo']=='porcentaje_no_suma_100' for x in validar(bundle['hechos']))==7

def test_comparacion_no_toma_periodos_no_consecutivos(bundle):
    old=deepcopy(bundle['hechos'])
    for f in old:f['bimestre']='2024-07'
    s=serie(bundle['hechos']+old)[-1]
    assert s['anterior']['cambio_pp'] is None and s['interanual']['cambio_pp']==0

def test_proyeccion_no_ajusta_estacionalidad_con_muestra_corta():
    assert not pronostico([{'bimestre':'2025-01','rotacion':10}])['disponible']

def test_atipico_detectado_con_historial(bundle):
    facts=[]
    for p in ['2025-01','2025-03','2025-05']:
        fs=deepcopy(bundle['hechos'])
        for f in fs:
            f['bimestre']=p
            if f['metrica']=='plantilla_operativa' and f['empresa']=='COMPAÑIA 1' and p=='2025-03':f['valor']=25000
        facts+=fs
    x=next(x for x in validar(facts) if x['codigo']=='atipico_plantilla' and x['empresa']=='COMPAÑIA 1' and x['bimestre']=='2025-03')
    assert len(x['historial'])==3
