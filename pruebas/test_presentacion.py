"""Regresiones de las capturas: tipos, fechas, identidad, reporte y descargas."""
from aplicacion.presentacion import lectura_visual
from aplicacion.reporte import generar
from conftest import login

def fact(empresa='A',periodo='2025-07',valor=40,unidad='porcentaje',texto=None,estado='valido',**extra):
    return dict(empresa=empresa,bimestre=periodo,valor=valor,unidad=unidad,texto=texto,estado=estado,dimension='opcion',metrica='prueba',excluido=False,**extra)

def test_porcentajes_promedio_explicito_y_valor_unico():
    fs=[fact(valor=40),fact(empresa='B',valor=60),fact(periodo='2025-05',valor=99)]
    r=lectura_visual(fs,{},'2025-07')['grupos'][0]
    assert r['valor']==50 and r['metodo']=='promedio' and r['numericas']==2
    r=lectura_visual(fs[:1],{})['grupos'][0]
    assert r['valor']==40 and r['metodo']=='exacto'

def test_textos_no_son_mediana_vacia_y_ceros_se_conservan():
    fs=[fact(valor=None,unidad='texto',texto='Pendiente',estado='texto'),fact(empresa='B',valor=None,unidad='texto',texto='Pendiente',estado='texto'),fact(empresa='C',valor=None,unidad='texto',estado='vacio')]
    r=lectura_visual(fs,{})
    assert r['grupos'][0]['categorias']==[{'etiqueta':'Pendiente','empresas':2}]
    assert r['empresas_respuesta']==2 and r['sin_respuesta']==1
    assert lectura_visual([fact(valor=0)],{})['grupos'][0]['valor']==0

def test_unidades_separadas_intervalos_no_imputados_y_rechazados_no_categorias():
    fs=[fact(valor=24,unidad='horas'),fact(valor=1,unidad='dias'),fact(valor=None,texto='más del 15%',estado='intervalo_no_puntual'),fact(valor=None,texto='999',estado='porcentaje_fuera_rango')]
    groups=lectura_visual(fs,{})['grupos']
    assert len(groups)==3
    pct=next(g for g in groups if g['unidad']=='porcentaje')
    assert pct['valor'] is None and pct['sin_respuesta']==1
    assert pct['declaraciones']==[{'etiqueta':'más del 15%','empresas':1}]

def test_no_suma_plantilla_ni_vacantes_entre_bimestres_y_hora_no_promediada():
    r=lectura_visual([fact(valor=100,unidad='personas'),fact(valor=300,unidad='personas',periodo='2025-05')],{})
    assert r['grupos'][0]['valor']==100
    clock=lectura_visual([fact(valor=23,unidad='hora_del_dia'),fact(empresa='B',valor=1,unidad='hora_del_dia')],{})['grupos'][0]
    assert clock['valor'] is None
    assert {c['etiqueta'] for c in clock['categorias']}=={'23:00','01:00'}

def test_reporte_autonomo_numerado_con_graficos_y_sin_columnas_confusas(client):
    r=client.get('/api/reporte')
    assert r.status_code==200
    assert '<ol>' in r.text and '<svg' in r.text and 'data:image/png;base64,' in r.text
    assert '<th scope="col">Unidad</th>' not in r.text and '<th scope="col">Mediana</th>' not in r.text
    assert 'número de observaciones' in r.text and 'Prestaciones al personal' in r.text
    assert 'Lectura del gráfico' in r.text and 'sin imputación' in r.text
    assert '<td></td>' not in r.text and '/static/reporte.css' not in r.text
    assert "'sha256-" in r.headers['content-security-policy']
    login(client,'cliente');body=client.get('/api/reporte?empresas=COMPAÑIA%202').text
    assert 'COMPAÑIA 2' not in body and 'COMPAÑIA 1' not in body

def test_lectura_api_filtra_periodo_y_empresa(client):
    r=client.get('/api/explorar?metrica=bajas_motivo&empresas=COMPAÑIA%201&periodos=2025-07').json()
    assert r['lectura']['empresas_respuesta']==1
    assert len(r['lectura']['grupos'])==2
    assert client.get('/api/explorar?metrica=bajas&periodos=2025-07&corte=2025-05').status_code==422

def test_reporte_textos_y_fuentes_sin_codigo_y_escape():
    dictionary={'x':{'metrica':'negociacion_estatus','accion':'incluir','pregunta':'Estatus','subopcion':'Estatus','dimension':'total','unidad':'texto','categoria':'relaciones'},'y':{'metrica':'fuentes_uso','accion':'incluir','pregunta':'Fuentes operativo','subopcion':'Portal laboral','dimension':'1234abcd:portal','unidad':'escala_0_10','categoria':'reclutamiento'}}
    fs=[{**fact(valor=None,unidad='texto',texto='<script>texto</script>',estado='texto'),'metrica':'negociacion_estatus','dimension':'total'},{**fact(valor=8,unidad='escala_0_10'),'metrica':'fuentes_uso','dimension':'1234abcd:portal'}]
    body=generar(fs,dictionary,'Prueba')
    assert '<script>texto</script>' not in body and '&lt;script&gt;texto&lt;/script&gt;' in body
    assert '1234abcd:' not in body and 'Portal laboral' in body
    assert 'Son categorías, no valores faltantes' in body

def test_escala_etiquetada_solo_opciones_inequivocas_sin_mutar_origen():
    from copy import deepcopy
    fs=[fact(valor=None,unidad='escala_0_10',texto='0 - No Utilizada',estado='texto_no_numerico'),fact(empresa='B',valor=None,unidad='escala_0_10',texto='10 - Todas mis contrataciones son por este medio',estado='texto_no_numerico'),fact(empresa='C',valor=None,unidad='escala_0_10',texto='8 quizá',estado='texto_no_numerico')]
    before=deepcopy(fs);r=lectura_visual(fs,{})
    assert r['escalas_etiquetadas']==2 and fs==before
    g=r['grupos'][0];assert g['valor']==5 and g['numericas']==2 and g['empresas_numericas']==2
    assert g['declaraciones']==[{'etiqueta':'8 quizá','empresas':1}]

def test_casillas_comparten_grafico_y_porcentaje_pequeno_no_se_reescala():
    fs=[{**fact(valor=None,unidad='texto',texto=m,estado='texto'),'dimension':m} for m in ['Enero','Febrero']]
    r=lectura_visual(fs,{})
    assert len(r['graficos_texto'])==1 and len(r['graficos_texto'][0]['categorias'])==2
    r=lectura_visual([fact(valor=.08)],{})
    assert r['grupos'][0]['valor']==.08 and r['porcentajes_menores_a_uno']==1
