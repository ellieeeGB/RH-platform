/* Lecturas visuales: una pregunta, un bimestre y una explicación junto al gráfico. */
const symbols={porcentaje:'%',proporcion:'%',personas:'personas',eventos:'eventos',horas:'h',dias:'días',escala_0_10:'/ 10',mxn_anio:'MXN / año',mxn_platillo:'MXN / platillo',mxn_persona_mes:'MXN / persona / mes',hora_del_dia:'h del día',numero:'',texto:'',seleccion:''};
const valueLabel=(v,u,exact=false)=>RHLectura.valid(v)?`${fmt(v,exact?20:2)}${u==='porcentaje'?' %':symbols[u]?' '+symbols[u]:''}`:'Sin respuesta válida';
let renewal=null;
async function authenticatedFetch(path,options={},retry=true){
 const isForm=options.body instanceof FormData;
 let res=await fetch('/api'+path,{credentials:'same-origin',...options,headers:{...(isForm?{}:{'Content-Type':'application/json'}),'X-CSRF-Token':csrf,...options.headers}});
 if(res.status===401&&retry&&!path.startsWith('/auth')&&csrf){
  if(!renewal)renewal=fetch('/api/auth/refresh',{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':csrf}}).finally(()=>{renewal=null;});
  const refreshed=await renewal;if(refreshed.ok)return authenticatedFetch(path,options,false);
 }
 if(!res.ok){let error;try{error=await res.json();}catch{error={detail:'No fue posible completar la solicitud.'};}
  if(res.status===401&&path!=='/auth/login'){showLogin();$('#loginError').textContent='Tu sesión terminó. Inicia sesión de nuevo para continuar.';}
  throw new Error(typeof error.detail==='string'?error.detail:'Revisa los campos de la solicitud.');
 }
 return res;
}
async function downloadStudy(kind,button){
 if(!selection('company').length||!selection('period').length)return notify('Selecciona al menos una empresa y un bimestre.');
 if(window.CATCH_DEMO)return notify('Esta vista contiene datos ficticios. Las descargas están disponibles al iniciar la aplicación conectada al estudio.');
 button.disabled=true;
 try{
  const response=await authenticatedFetch((kind==='csv'?'/exportar?':'/reporte?')+query());
  const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=kind==='csv'?'catch_estudio_normalizado.csv':'catch_reporte_visual.html';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  notify(kind==='csv'?'CSV descargado con las empresas y bimestres seleccionados.':'Reporte descargado. Ábrelo y usa Imprimir → Guardar como PDF si necesitas el PDF.');
 }catch(e){notify(e.message);}finally{button.disabled=false;}
}
function dimensionLabel(metric,dim){return filters.catalogo?.find(d=>d.metrica===metric)?.dimensiones?.[dim]||dim.replace(/^[0-9a-f]{8}:/,'');}
function statName(g){return g.metodo==='exacto'?'Valor reportado':g.metodo==='suma'?'Total reportado':'Promedio por respuesta';}
function limitedBars(items,unit,limit=8){const max=Math.max(1,...items.map(x=>Math.abs(x.value)));return bars(items.slice(0,limit),unit,'',max)+(items.length>limit?`<details class="more-chart"><summary>Ver las otras ${items.length-limit} opciones</summary>${bars(items.slice(limit),unit,'',max)}</details>`:'');}
function readingChart(groups,declaredGroups){
 const numeric=groups.filter(g=>RHLectura.valid(g.valor));
 const units=[...new Set(numeric.map(g=>g.unidad))];
 let content=units.map(unit=>{const rows=numeric.filter(g=>g.unidad===unit).sort((a,b)=>b.valor-a.valor),first=rows[0];
  const leading=rows[0],same=rows.every(g=>g.valor===leading.valor);
  const explanation=rows.length===1?`${leading.etiqueta}: ${valueLabel(leading.valor,unit)}.`:same?'Los valores disponibles son iguales.':`${leading.etiqueta} presenta el mayor valor mostrado: ${valueLabel(leading.valor,unit)}.`;
  return `<section class="reading-group"><div class="reading-plot"><h3>${esc((rows.some(g=>g.metodo==='promedio')?'Promedio por respuesta':rows.some(g=>g.metodo==='suma')?'Total reportado':'Valores reportados'))}</h3>${limitedBars(rows.map(g=>({label:g.etiqueta,value:g.valor,decimals:g.metodo==='exacto'?20:2,note:`${g.empresas_numericas??g.empresas} empresas · ${g.numericas} respuestas numéricas`})),symbols[unit]||'')}</div><aside class="chart-insight"><span class="eyebrow">CÓMO LEERLO</span><h3>${esc(explanation)}</h3><p>${first.metodo==='suma'?'Se suman las respuestas válidas de este bimestre por opción.':'Si hay una sola respuesta se muestra su valor exacto. Con varias respuestas se muestra su promedio, no su suma.'}</p><p>La cobertura puede variar entre opciones. Revisa los valores por empresa antes de comparar.</p>${rows.some(g=>g.empresas<5)?'<p class="sample-note">Menos de 5 empresas en alguna opción: lectura exploratoria.</p>':''}</aside></section>`;
 }).join('');
 const textGroups=declaredGroups||groups.filter(g=>g.categorias.length||g.declaraciones.length);
 content+=textGroups.map(g=>{
  const cats=g.categorias.length?g.categorias:g.declaraciones,top=cats[0];
  return `<section class="reading-group categorical"><div class="reading-plot"><h3>${esc(g.etiqueta==='total'?'Respuestas declaradas':g.etiqueta)}</h3>${limitedBars(cats.map(c=>({label:c.etiqueta,value:c.empresas})), 'empresas')}</div><aside class="chart-insight"><span class="eyebrow">QUÉ ESTÁN REPORTANDO</span><h3>${top.empresas} ${top.empresas===1?'empresa declara':'empresas declaran'} la respuesta más frecuente.</h3><p class="quoted-response">${esc(top.etiqueta)}</p><p>${g.categorias.length?'Se cuenta cada empresa una vez por respuesta en este bimestre. Las selecciones múltiples pueden sumar más que el total de empresas.':'Estas declaraciones no son valores puntuales; se conservan separadas del cálculo numérico.'}</p></aside></section>`;
 }).join('');
 return content||'<div class="empty-chart"><h3>No hay respuestas válidas para esta pregunta en el bimestre elegido.</h3><p>Prueba otro bimestre o consulta los estados de origen. Una celda vacía no significa cero.</p></div>';
}
const journeys={rotacion:['bajas_motivo','bajas_antiguedad','bajas_edad','bajas'],reclutamiento:['contrataciones_desglose','vacantes_proximas','tiempo_contratacion','fuentes_uso','fuentes_seleccion','rechazo_motivo'],relaciones:['negociacion_estatus','incremento_otorgado','incremento_planeado','incremento_meses','incremento_meses_previstos'],ausentismo:['faltas','incapacidades','incapacidades_tipo'],capacitacion:['capacitacion_horas'],beneficios:['costo_transporte','costo_comedor','costo_sgmm'],contexto:['plantilla_operativa','plantilla_administrativa','sector','municipio','tier','genero']};
async function renderExplorer(seq){
 const candidates=(filters.catalogo||[]).filter(d=>d.tema===view);
 if(!candidates.length){$('#content').innerHTML='<section class="panel empty">Esta categoría no tiene preguntas en el estudio.</section>';return;}
 const metric=candidates.some(d=>d.metrica===currentMetric)?currentMetric:candidates.some(d=>d.metrica===defaults[view])?defaults[view]:candidates[0].metrica;currentMetric=metric;
 const periods=selection('period').sort();if(!periods.includes(metricPeriod))metricPeriod=periods.at(-1);
 const args=new URLSearchParams(query());args.set('metrica',metric);args.set('pagina',explorerPage);args.set('corte',metricPeriod);
 const r=await api('/explorar?'+args);if(seq!==requestNumber)return;
 const l=r.lectura;
 const tabs=(journeys[view]||candidates.slice(0,4).map(d=>d.metrica)).filter(m=>candidates.some(d=>d.metrica===m));
 $('#content').innerHTML=`<div class="topic-tabs" aria-label="Preguntas principales">${tabs.map(m=>`<button data-metric-tab="${m}" class="${m===metric?'selected':''}" aria-pressed="${m===metric}">${esc(metricName(m))}</button>`).join('')}</div><section class="panel metric-story"><div class="metric-controls"><label>¿Qué quieres conocer?<select id="metric">${candidates.map(d=>`<option value="${esc(d.metrica)}" ${d.metrica===metric?'selected':''}>${esc(d.titulo)}</option>`).join('')}</select></label><label>Bimestre de la lectura<select id="metricPeriod">${periods.map(p=>`<option value="${p}" ${p===metricPeriod?'selected':''}>${esc(periodLabel(p))}</option>`).join('')}</select></label></div><div class="panel-head"><div><p class="eyebrow">${esc(names[view])} · ${esc(periodLabel(metricPeriod))}</p><h2>${esc(metricName(metric))}</h2></div></div><div class="reading-coverage"><strong>${l.empresas_respuesta}<small>empresas con respuesta</small></strong><strong>${l.respuestas}<small>respuestas disponibles</small></strong><strong>${l.sin_respuesta}<small>celdas sin respuesta válida</small></strong><p>Gráficos de un solo bimestre.<br>Cambia la fecha para consultar los demás.</p></div>${l.porcentajes_menores_a_uno?'<p class="sample-note">Hay porcentajes inferiores al 1%. Confirma su escala con quien elaboró el estudio antes de comparar. Se conservan los valores originales.</p>':''}${l.escalas_etiquetadas?'<p class="micro-note">Las opciones «0 - No Utilizada» y «10 - Todas mis contrataciones son por este medio» se leen como 0 y 10. El texto original se conserva.</p>':''}<div id="metricVisual">${readingChart(l.grupos,l.graficos_texto)}${!l.respuestas&&l.periodos_con_respuesta?.length?`<p class="question">Sí hay respuestas en ${l.periodos_con_respuesta.map(periodLabel).map(esc).join(", ")}. Elige uno de esos bimestres arriba.</p>`:""}</div><details class="method-details"><summary>Ver la pregunta original y los estados del dato</summary>${[...new Set(r.definiciones.map(d=>d.pregunta))].map(q=>`<p>${esc(q)}</p>`).join('')}${table(['Estado','Celdas'],Object.entries(l.estados).map(([k,v])=>[esc(human(k)),fmt(v)]))}<p>Los faltantes y los valores excluidos no entran al cálculo. No se suman porcentajes, costos por persona ni plantillas de fechas distintas.</p></details></section>
 ${view==='reclutamiento'?'<div class="recruit-bridge"><span>¿Qué puestos debes cubrir? Registra cantidades, fechas, notas y tareas.</span><button data-go="planes">Crear un plan de contratación ↗</button></div>':''}
 <section class="panel source-panel"><details><summary>Ver todas las cifras de ${esc(periodLabel(metricPeriod))}</summary>${table(['Opción','Resultado','Cómo se calcula','Empresas con respuesta'],l.grupos.map(g=>[esc(g.etiqueta),RHLectura.valid(g.valor)?esc(valueLabel(g.valor,g.unidad,g.metodo==='exacto')):(g.categorias.length||g.declaraciones.length?[...g.categorias,...g.declaraciones].map(c=>`${esc(c.etiqueta)}: ${c.empresas} empresas`).join('<br>'):'Sin respuesta válida'),RHLectura.valid(g.valor)?esc(statName(g)):'Conteo de empresas por respuesta',g.empresas]))}</details></section>
 <section class="panel source-panel"><details ${explorerPage>1?'open':''}><summary>Valores exactos por empresa y bimestre · ${r.total} registros</summary><p>Incluye todos los bimestres seleccionados en los filtros superiores. Página ${r.pagina} de ${Math.max(1,Math.ceil(r.total/100))}.</p>${table(['Empresa','Bimestre','Opción','Valor reportado','Estado','Origen',''],r.filas.map(f=>[esc(f.empresa),esc(periodLabel(f.bimestre)),esc(dimensionLabel(metric,f.dimension)),f.valor!==null?esc(valueLabel(f.valor,f.unidad,true)):esc(f.texto||'Sin respuesta'),esc(f.excluido?'Excluido':human(f.estado)),`${esc(f.hoja)} · fila ${f.fila} · columna ${f.columna}`,user.rol==='cliente'?'':`<button data-adjust="${f.id}" data-value="${f.valor??''}">Revisar</button>`]))}<div class="inline-actions"><button id="prev" ${explorerPage===1?'disabled':''}>Anterior</button><button id="next" ${explorerPage*100>=r.total?'disabled':''}>Siguiente</button></div></details></section>`;
 $('#metric').value=metric;$('#metricPeriod').value=metricPeriod;
 $('#metric').onchange=e=>{currentMetric=e.target.value;explorerPage=1;render();};
 $('#metricPeriod').onchange=e=>{metricPeriod=e.target.value;render();};
 document.querySelectorAll('[data-metric-tab]').forEach(b=>b.onclick=()=>{currentMetric=b.dataset.metricTab;explorerPage=1;render();});
 $('#prev').onclick=()=>{explorerPage--;render();};$('#next').onclick=()=>{explorerPage++;render();};bindAdjust();bindNavigation();
}
function qualityReading(issue){
 const current=issue.historial.find(x=>x.bimestre===issue.bimestre),others=issue.historial.filter(x=>x.bimestre!==issue.bimestre&&RHLectura.valid(x.valor)),base=RHLectura.mediana(others.map(x=>x.valor));
 const ratio=base>0&&current?current.valor/base:null;
 return `<div class="quality-reading"><div>${chart(issue.historial,'valor','Plantilla operativa (personas)')}</div><aside class="chart-insight"><span class="eyebrow">INTERPRETACIÓN</span><h3>${current?fmt(current.valor)+' operativos reportados':'Un cambio que merece revisión'}</h3><p>${ratio!==null?`Equivale a ${fmt(ratio,1)} veces el punto medio de sus otros ${others.length} bimestres (${fmt(base)} personas).`:'No hay suficiente historial válido para expresar una comparación temporal.'}</p><p>Una plantilla inusualmente alta puede reducir la tasa de rotación, porque aumenta su denominador. El cambio puede ser real o un error de captura.</p><strong>Siguiente paso</strong><p>Confirma el reporte original. Usa la comparación con y sin el registro antes de decidir; toda corrección requiere un motivo.</p><details><summary>Criterio de detección</summary><p>${esc(issue.detalle)}</p></details></aside></div>`;
}
