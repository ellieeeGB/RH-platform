/* Pruebas del DOM con datos ficticios. No renderizan píxeles ni sustituyen QA visual. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Window} from 'happy-dom';
const html=readFileSync(new URL('../documentacion/vista_previa.html',import.meta.url),'utf8');
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
 await click(w,'[data-metric-tab="tiempo_contratacion"]');assert.match(d.querySelector('.metric-story h2').textContent,/Tiempo/);assert.ok(d.querySelector('#next'));
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
