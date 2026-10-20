/* Pruebas del DOM con datos ficticios. No renderizan píxeles ni sustituyen QA visual. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const html=readFileSync(new URL('../documentacion/catch_rh_vacantes_v2.html',import.meta.url),'utf8');
async function start(t){
 const w=new Window({url:'https://vista.local',settings:{enableJavaScriptEvaluation:true,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 t.after(()=>w.happyDOM.close());w.document.write(html);await w.happyDOM.whenAsyncComplete();return w;
}
const click=async(w,selector)=>{const el=w.document.querySelector(selector);assert.ok(el,selector);el.click();await w.happyDOM.whenAsyncComplete();};
test('Inicio carga ocho empresas, siete periodos, cifras y gráfica sin NaN',async t=>{
 const w=await start(t),d=w.document;
 assert.equal(d.querySelector('#app').hidden,false);assert.equal(d.querySelectorAll('input[name=company]:checked').length,8);assert.equal(d.querySelectorAll('input[name=period]:checked').length,7);
 assert.match(d.querySelector('#heroTitle').textContent,/contrataciones|bajas/);assert.equal(d.querySelectorAll('.metric-card').length,4);assert.equal(d.querySelectorAll('.priority').length,3);assert.doesNotMatch(d.querySelector('#content').innerHTML,/NaN|undefined/);
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
test('Presentación abre evidencia y la agenda conserva sus accesos',async t=>{
 const w=await start(t),d=w.document;await click(w,'#story');assert.equal(d.querySelector('#dialog').open,true);await click(w,'#storyNext');assert.match(d.querySelector('.story-number').textContent,/2 DE 3/);await click(w,'#storyEvidence');assert.equal(d.querySelector('#dialog').open,false);assert.equal(d.querySelector('#breadcrumb').textContent,'Rotación');
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

test('Cargar estudio es visible desde la barra y el movimiento puede reducirse',async t=>{
 const w=await start(t),d=w.document;
 assert.equal(d.querySelector('#uploadTop').hidden,false);await click(w,'#uploadTop');assert.ok(d.querySelector('#uploadForm'));
 await click(w,'#motion');assert.equal(d.body.classList.contains('reduce-motion'),true);assert.equal(d.querySelector('#motion').getAttribute('aria-pressed'),'true');
 await click(w,'#motion');assert.equal(d.body.classList.contains('reduce-motion'),false);
});
test('Catálogo encuentra preguntas de todo el estudio y muestra cobertura real de la demo',async t=>{
 const w=await start(t),d=w.document;await click(w,'[data-view="catalogo"]');
 assert.equal(d.querySelector('.catalog-count strong').textContent,'183');assert.equal(d.querySelectorAll('.catalog-result').length,183);
 const search=d.querySelector('#catalogSearch');search.value='contingencia';search.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.ok(d.querySelectorAll('.catalog-result').length>0);assert.ok(d.querySelectorAll('.catalog-result').length<183);
 await click(w,'[data-open-metric]');assert.match(d.querySelector('.metric-story h2').textContent.toLowerCase(),/contingencia/);
 assert.match(d.querySelector('#metricVisual').textContent,/No hay respuestas/);
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
