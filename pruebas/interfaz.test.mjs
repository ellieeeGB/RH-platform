/* Pruebas del DOM con datos ficticios. No renderizan píxeles ni sustituyen QA visual. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const html=readFileSync(new URL('../documentacion/catch_rh_visual_v4.html',import.meta.url),'utf8');
async function start(t){
 const w=new Window({url:'https://vista.local',settings:{enableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 t.after(()=>w.happyDOM.close());w.document.write(html);await w.happyDOM.whenAsyncComplete();return w;
}
const click=async(w,selector)=>{const el=w.document.querySelector(selector);assert.ok(el,selector);el.click();await w.happyDOM.whenAsyncComplete();};
test('Inicio carga ocho empresas, siete periodos, cifras y gráfica sin NaN',async t=>{
 const w=await start(t),d=w.document;
 assert.equal(d.querySelector('#app').hidden,false);assert.equal(d.querySelectorAll('input[name=company]:checked').length,8);assert.equal(d.querySelectorAll('input[name=period]:checked').length,7);
 assert.match(d.querySelector('#heroTitle').textContent,/contrataciones|bajas/);assert.equal(d.querySelectorAll('.metric-card').length,4);assert.equal(d.querySelectorAll('.next-step-grid>button').length,3);assert.equal(d.querySelector('.story-hero'),null);assert.doesNotMatch(d.querySelector('#content').innerHTML,/NaN|undefined/);
 await click(w,'[data-trend="balance"]');assert.match(d.querySelector('#trendContent').textContent,/Contrataciones menos bajas/);
});
test('Mapa abre trayectorias y responde a filtros de empresas y periodos',async t=>{
 const w=await start(t),d=w.document;await click(w,'[data-view="comparar"]');assert.equal(d.querySelectorAll('.heat-cell').length,56);
 await click(w,'.heat-cell');assert.equal(d.querySelector('#dialog').open,true);assert.match(d.querySelector('#dialogContent').textContent,/COMPAÑIA 1/);await click(w,'#closeDialog');
 [...d.querySelectorAll('input[name=company]')].forEach((x,i)=>x.checked=i<2);[...d.querySelectorAll('input[name=period]')].forEach((x,i)=>x.checked=i<2);await click(w,'#apply');assert.equal(d.querySelectorAll('.heat-cell').length,4);
 assert.match(d.querySelector('#companySummary').textContent,/2 empresas/);
});
test('Explorador cambia de pregunta y conserva resultados completos y paginación',async t=>{
 const w=await start(t),d=w.document;await click(w,'[data-view="reclutamiento"]');assert.ok(d.querySelectorAll('.bar-row').length>0);
 await click(w,'[data-metric-tab="tiempo_contratacion"]');assert.match(d.querySelector('.metric-story h2').textContent,/Días para contratar/);assert.ok(d.querySelector('#next'));
 await click(w,'#next');assert.match(d.querySelector('.source-panel:last-child').textContent,/Página 2/);assert.equal(d.querySelector('.source-panel:last-child details').open,true);
 await click(w,'[data-metric-tab="vacantes_proximas"]');assert.equal(d.querySelector('[data-stat="suma"]'),null,'No sumar vacantes a través de siete periodos');
});
test('Calidad muestra sensibilidad sin alterar el dato ficticio',async t=>{
 const w=await start(t),d=w.document;
 w.CATCH_DEMO.incidencias.push({codigo:'atipico_plantilla',empresa:'COMPAÑIA 1',bimestre:'2025-07',detalle:'Señal ficticia para comprobar interacción',historial:[{bimestre:'2025-05',valor:195},{bimestre:'2025-07',valor:195}]});
 const before=JSON.stringify(w.CATCH_DEMO.hechos);await click(w,'[data-view="calidad"]');await click(w,'[data-impact="0"]');assert.equal(d.querySelector('#dialog').open,true);assert.match(d.querySelector('#dialogContent').textContent,/No modifica el estudio/);assert.match(d.querySelector('#dialogContent').textContent,/Sin registro/);assert.equal(JSON.stringify(w.CATCH_DEMO.hechos),before);
});
test('Se retiran presentar y mis vistas; la agenda conserva sus accesos',async t=>{
 const w=await start(t),d=w.document;assert.equal(d.querySelector('#story'),null);assert.equal(d.querySelector('.saved-views'),null);
 await click(w,'[data-view="agenda"]');assert.equal(d.querySelectorAll('.priority').length,3);assert.equal(d.querySelectorAll('.topic-links button').length,3);
});
test('Selección vacía se rechaza y el tema conserva la navegación',async t=>{
 const w=await start(t),d=w.document;d.querySelectorAll('input[name=period]').forEach(x=>x.checked=false);await click(w,'#apply');assert.match(d.querySelector('#notice').textContent,/Selecciona al menos/);await click(w,'#theme');assert.equal(d.body.classList.contains('night'),true);assert.equal(d.querySelectorAll('#nav button[aria-current="page"]').length,1);
});
test('El escenario actualiza el resultado y rechaza una plantilla negativa',async t=>{
 const w=await start(t),d=w.document;await click(w,'[data-view="escenarios"]');
 const change=(name,value)=>{const el=d.querySelector(`#scenario [name="${name}"]`);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 change('base','100');change('altas','20');change('bajas','5');change('costo','1000');
 assert.equal(d.querySelector('.scenario-total').textContent,'115');assert.match(d.querySelector('.scenario-cost').textContent,/20,000/);
 change('bajas','150');assert.match(d.querySelector('#scenarioResult').textContent,/superan/);
});

test('Logo en acceso y plataforma, carga visible y sin control manual de movimiento',async t=>{
 const w=await start(t),d=w.document;assert.equal(d.querySelectorAll('img[alt="Catch Consulting"]').length,2);
 assert.equal(d.querySelector('#uploadTop').hidden,false);await click(w,'#uploadTop');assert.ok(d.querySelector('#uploadForm'));
 assert.equal(d.querySelector('#motion'),null);assert.equal(d.querySelector('[data-view="otros"]'),null);
});
test('Catálogo encuentra preguntas de todo el estudio y muestra cobertura real de la demo',async t=>{
 const w=await start(t),d=w.document;await click(w,'[data-view="catalogo"]');
 assert.equal(d.querySelector('.catalog-count strong').textContent,'183');assert.equal(d.querySelector('#catalogDetail').hidden,true);assert.ok(d.querySelectorAll('.catalog-result').length<=8);
 const search=d.querySelector('#catalogSearch');search.value='contingencia';search.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.ok(d.querySelectorAll('.catalog-result').length>0);assert.ok(d.querySelectorAll('.catalog-result').length<183);
 await click(w,'[data-open-metric]');assert.match(d.querySelector('.metric-story h2').textContent.toLowerCase(),/contingencia/);
 assert.match(d.querySelector('#metricVisual').textContent,/No hay respuestas válidas/);
});
test('Vacante demo guarda notas y acciones, se edita y conserva historial sin cambiar la encuesta',async t=>{
 const w=await start(t),d=w.document,before=JSON.stringify(w.CATCH_DEMO.hechos);
 await click(w,'[data-view="planes"]');assert.equal(d.querySelectorAll('.vacancy-card').length,0);await click(w,'#newPlan');
 const set=(name,value)=>{const el=d.querySelector(`#planForm [name="${name}"]`);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 set('puesto','Técnico de mantenimiento');set('plazas','3');set('notas','Revisar candidatos del convenio técnico.');
 await click(w,'#addPlanAction');const task=d.querySelector('[data-field="tarea"]');task.value='Agendar entrevistas';task.dispatchEvent(new w.Event('input',{bubbles:true}));
 await click(w,'#planForm [type="submit"]');assert.equal(d.querySelector('#dialog').open,false);assert.equal(d.querySelectorAll('.vacancy-card').length,1);
 assert.match(d.querySelector('.vacancy-card').textContent,/Agendar entrevistas/);assert.match(w.localStorage.getItem('catch-demo-planes-v1'),/Revisar candidatos/);
 await click(w,'[data-edit-plan]');set('cubiertas','3');await click(w,'#planForm [type="submit"]');
 assert.match(d.querySelector('.board-column:nth-child(4)').textContent,/Técnico de mantenimiento/);
 await click(w,'[data-edit-plan]');await click(w,'#planHistory');assert.equal(d.querySelectorAll('#planHistoryContent details').length,2);
 assert.match(d.querySelector('#planHistoryContent').textContent,/Agendar entrevistas/);await click(w,'#closeDialog');
 await click(w,'[data-view="inicio"]');await click(w,'[data-view="planes"]');assert.equal(d.querySelectorAll('.vacancy-card').length,1);
 assert.equal(JSON.stringify(w.CATCH_DEMO.hechos),before);
});
test('Formulario conserva el borrador al rechazar plazas incoherentes',async t=>{
 const w=await start(t),d=w.document;await click(w,'[data-view="planes"]');await click(w,'#newPlan');
 d.querySelector('[name="puesto"]').value='Puesto de prueba';d.querySelector('[name="cubiertas"]').value='2';
 await click(w,'#planForm [type="submit"]');assert.equal(d.querySelector('#dialog').open,true);assert.match(d.querySelector('#planError').textContent,/no pueden superar/);
 assert.equal(w.localStorage.getItem('catch-demo-planes-v1'),null);
});

test('Panorama resume motivos y vacantes del último bimestre y responde a los filtros',async t=>{
 const w=await start(t),d=w.document;
 const totals=(metric,period,company)=>{
  const groups=new Map();w.CATCH_DEMO.hechos.filter(f=>f.metrica===metric&&f.bimestre===period&&(!company||f.empresa===company)&&typeof f.valor==='number'&&!f.excluido).forEach(f=>groups.set(f.dimension,(groups.get(f.dimension)||0)+f.valor));
  return [...groups.values()].sort((a,b)=>b-a).slice(0,3).map(n=>new Intl.NumberFormat('es-MX').format(n));
 };
 assert.deepEqual([...d.querySelectorAll('#overviewDemand .vacancy-snapshot strong')].map(e=>e.textContent),totals('vacantes_proximas','2025-07'));
 assert.equal(d.querySelectorAll('#overviewReasons .bar-row').length,3);
 assert.match(d.querySelector('#overviewReasons .micro-note').textContent,/conciliación/);
 assert.equal(d.querySelector('.coverage-visual svg').getAttribute('aria-label'),'8 de 8 empresas con rotación calculable');
 d.querySelectorAll('input[name=company]').forEach(e=>e.checked=e.value==='COMPAÑIA 2');
 d.querySelectorAll('input[name=period]').forEach(e=>e.checked=['2024-07','2024-09'].includes(e.value));
 await click(w,'#apply');
 assert.deepEqual([...d.querySelectorAll('#overviewDemand .vacancy-snapshot strong')].map(e=>e.textContent),totals('vacantes_proximas','2024-09','COMPAÑIA 2'));
 assert.match(d.querySelector('#overviewDemand').textContent,/Sep–Oct 2024/);
 assert.equal(d.querySelector('.coverage-visual svg').getAttribute('aria-label'),'1 de 1 empresas con rotación calculable');
 await click(w,'.vacancy-signal [data-go="planes"]');assert.ok(d.querySelector('#newPlan'));
});
test('Panorama distingue cero de faltante en la demanda próxima',async t=>{
 const w=await start(t),d=w.document;
 const rows=w.CATCH_DEMO.hechos.filter(f=>f.metrica==='vacantes_proximas'&&f.bimestre==='2025-07');
 rows.forEach(f=>{f.valor=0;f.estado='valido';f.excluido=false;});await click(w,'#apply');
 assert.deepEqual([...d.querySelectorAll('#overviewDemand strong')].map(e=>e.textContent),['0','0']);
 rows.forEach(f=>{f.valor=null;f.estado='vacio';});await click(w,'#apply');
 assert.equal(d.querySelectorAll('#overviewDemand strong').length,0);assert.match(d.querySelector('#overviewDemand').textContent,/Sin cantidades válidas/);
});
test('Un fallo de motivos no bloquea indicadores ni vacantes del panorama',async t=>{
 const w=await start(t),d=w.document,original=w.fetch;
 w.fetch=(url,options)=>url.includes('metrica=bajas_motivo')?Promise.reject(new Error('Fallo de consulta de prueba')):original(url,options);
 await click(w,'#apply');assert.match(d.querySelector('#overviewReasons').textContent,/No fue posible/);
 assert.equal(d.querySelectorAll('.metric-card').length,4);assert.equal(d.querySelectorAll('#overviewDemand strong').length,2);
});

test('CSV renueva sesión antes de descargar y conserva filtros; reporte usa la misma ruta',async t=>{
 const w=await start(t),d=w.document;w.CATCH_DEMO=null;
 const calls=[],downloads=[];let expired=true;
 w.setTimeout=()=>0;w.URL.createObjectURL=()=> 'blob:https://vista.local/prueba';w.URL.revokeObjectURL=()=>{};
 d.addEventListener('click',e=>{if(e.target.matches('a[download]')){e.preventDefault();downloads.push(e.target.download);}});
 w.fetch=async(url,options)=>{calls.push({url,options});if(url==='/api/auth/refresh'){expired=false;return {ok:true,status:200};}if(expired)return {ok:false,status:401,json:async()=>({detail:'Inicie sesión.'})};return {ok:true,status:200,blob:async()=>new w.Blob(['contenido'])};};
 await click(w,'#exportCsv');assert.equal(calls[0].url.startsWith('/api/exportar?'),true);assert.equal(calls[1].url,'/api/auth/refresh');assert.equal(calls[2].url,calls[0].url);
 assert.equal(calls[1].options.headers['X-CSRF-Token'],'demo-local');assert.equal(downloads[0],'catch_estudio_normalizado.csv');assert.equal(d.querySelector('#app').hidden,false);
 await click(w,'#report');assert.equal(downloads[1],'catch_reporte_visual.html');assert.match(calls.at(-1).url,/periodos=/);
});
test('Descarga con renovación rechazada vuelve al acceso y explica el motivo',async t=>{
 const w=await start(t),d=w.document;w.CATCH_DEMO=null;
 w.fetch=async()=>({ok:false,status:401,json:async()=>({detail:'La sesión terminó.'})});
 await click(w,'#exportCsv');assert.equal(d.querySelector('#login').hidden,false);assert.match(d.querySelector('#loginError').textContent,/sesión terminó/);assert.equal(d.querySelector('#exportCsv').disabled,false);
});
test('Texto en contexto usa frecuencias; porcentajes muestran símbolo y lectura de un bimestre',async t=>{
 const w=await start(t),d=w.document;
 await click(w,'[data-view="contexto"]');assert.equal(d.querySelector('#metricPeriod').value,'2025-07');
 await click(w,'[data-metric-tab="genero"]');assert.match(d.querySelector('#metricVisual').textContent,/%/);assert.doesNotMatch(d.querySelector('#metricVisual').textContent,/porcentaje|Mediana/);
 const metric=d.querySelector('#metric');metric.value='sector';metric.dispatchEvent(new w.Event('change',{bubbles:true}));await w.happyDOM.whenAsyncComplete();
 assert.ok(d.querySelector('.categorical'));assert.match(d.querySelector('#metricVisual').textContent,/empresas declaran|empresa declara/);assert.doesNotMatch(d.querySelector('#metricVisual').textContent,/promedio|Valor central/);
});
test('Catálogo muestra ocho preguntas por página y la comparación identifica la métrica',async t=>{
 const w=await start(t),d=w.document;await click(w,'[data-view="catalogo"]');await click(w,'[data-topic="contexto"]');
 assert.equal(d.querySelector('#catalogDetail').hidden,false);assert.equal(d.querySelectorAll('.catalog-result').length,8);const first=d.querySelector('.catalog-result').textContent;
 await click(w,'#catalogNext');assert.notEqual(d.querySelector('.catalog-result').textContent,first);await click(w,'#catalogBack');assert.equal(d.querySelector('#catalogDetail').hidden,true);
 await click(w,'[data-view="comparar"]');assert.match(d.querySelector('#comparisonTitle').textContent,/Rotación.*%/);assert.match(d.querySelector('.heat-cell').textContent,/%/);
 const metric=d.querySelector('#mapMetric');metric.value='plantilla';metric.dispatchEvent(new w.Event('change'));assert.match(d.querySelector('#comparisonTitle').textContent,/Plantilla/);assert.match(d.querySelector('.heatmap caption').textContent,/Plantilla/);
});
