/* Adaptador exclusivo de la vista HTML autónoma. Nunca se carga en la aplicación. */
(function () {
 'use strict';
 const data=window.CATCH_DEMO,L=window.RHLectura;
 const valid=f=>!f.excluido&&['valido','corregido','hora_convertida','porcentaje_excel_convertido','fraccion_dia_convertida','proporcion_declarada_convertida'].includes(f.estado)&&L.valid(f.valor);
 const filter=url=>{
  const es=(url.searchParams.get('empresas')||'').split(',').filter(Boolean),ps=(url.searchParams.get('periodos')||'').split(',').filter(Boolean);
  return data.hechos.filter(f=>(!es.length||es.includes(f.empresa))&&(!ps.length||ps.includes(f.bimestre)));
 };
 const rows=fs=>{
  const groups=new Map();fs.forEach(f=>{const k=f.empresa+'|'+f.bimestre;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(f);});
  return [...groups.values()].map(g=>{
   const get=m=>{const a=g.filter(f=>f.metrica===m&&f.dimension==='total');return a.length===1&&valid(a[0])?a[0].valor:null;};
   const op=get('plantilla_operativa'),ad=get('plantilla_administrativa'),plantilla=op!==null&&ad!==null?op+ad:null,bajas=get('bajas'),contrataciones=get('contrataciones');
   return {empresa:g[0].empresa,bimestre:g[0].bimestre,operativos:op,administrativos:ad,plantilla,bajas,contrataciones,rotacion:plantilla>0&&bajas!==null?100*bajas/plantilla:null,balance:bajas!==null&&contrataciones!==null?contrataciones-bajas:null,n_personas_denominador:plantilla,n_reportes:1};
  });
 };
 function panel(fs){
  const detalle=rows(fs),periods=[...new Set(detalle.map(r=>r.bimestre))].sort();
  const serie=periods.map(bimestre=>{
   const rs=detalle.filter(r=>r.bimestre===bimestre),vs=rs.filter(r=>r.rotacion!==null),s=key=>{const x=rs.filter(r=>r[key]!==null);return x.length?x.reduce((s,r)=>s+r[key],0):null;},n=key=>rs.filter(r=>r[key]!==null).length;
   const den=vs.reduce((s,r)=>s+r.plantilla,0),bajas=vs.reduce((s,r)=>s+r.bajas,0);
   const point={bimestre,n_empresas:rs.length,n_rotacion:vs.length,n_plantilla:n('plantilla'),n_altas:n('contrataciones'),n_bajas:n('bajas'),n_balance:n('balance'),plantilla:s('plantilla'),contrataciones:s('contrataciones'),bajas:s('bajas'),balance:s('balance'),denominador_rotacion:den||null,bajas_pareadas:vs.length?bajas:null,rotacion:den?100*bajas/den:null,mediana_rotacion:L.mediana(vs.map(r=>r.rotacion)),muestra_pequena:vs.length<10};
   const [y,m]=bimestre.split('-').map(Number),prev=`${m>1?y:y-1}-${String(m>1?m-2:11).padStart(2,'0')}`,year=`${y-1}-${String(m).padStart(2,'0')}`;
   for(const [k,p] of [['anterior',prev],['interanual',year]]){const ev=L.evolucion(detalle,[p,bimestre],'rotacion');point[k]={bimestre:p,n_pareadas:ev.n,cambio_pp:ev.n?ev.puntos[1].valor-ev.puntos[0].valor:null};}
   return point;
  });
  return {detalle,serie,hallazgos:[],nota:'Plantilla: foto de cada bimestre. Rotación: bajas / (operativos + administrativos) × 100.',pronostico:{disponible:false,motivo:'La vista de diseño usa datos ficticios. La referencia temporal completa está disponible en la aplicación.'}};
 }
 function explore(fs,metric,page){
  const facts=fs.filter(f=>f.metrica===metric),groups=new Map();facts.forEach(f=>{if(!groups.has(f.dimension))groups.set(f.dimension,[]);groups.get(f.dimension).push(f);});
  const resumen=[...groups].map(([dimension,g])=>{const ns=g.filter(valid),texts=g.filter(f=>f.texto&&!f.excluido),categorias={};texts.forEach(f=>categorias[f.texto]=(categorias[f.texto]||0)+1);
   return {dimension,unidad:g[0].unidad,n_valores:ns.length,n_empresas:new Set(ns.map(f=>f.empresa)).size,n_respuestas:ns.length+texts.length,n_empresas_respuestas:new Set([...ns,...texts].map(f=>f.empresa)).size,mediana:L.mediana(ns.map(f=>f.valor)),suma:ns.length?ns.reduce((s,f)=>s+f.valor,0):null,categorias};});
  return {resumen,filas:facts.slice((page-1)*100,page*100),total:facts.length,pagina:page,definiciones:data.diccionario.filter(d=>d.metrica===metric)};
 }
 window.fetch=async(path,options={})=>{
  const u=new URL(path,'https://vista.local'),route=u.pathname.replace(/^\/api/,''),fs=filter(u);let body,status=200;
  if(route==='/me')body={nombre:'Vista de diseño',rol:'analista',csrf:'demo-local'};
  else if(route.startsWith('/auth/'))body={ok:true,csrf:'demo-local'};
  else if(route==='/filtros')body={empresas:[...new Set(data.hechos.map(f=>f.empresa))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true})).map(e=>({id:e,nombre:e})),periodos:[...new Set(data.hechos.map(f=>f.bimestre))].sort(),metricas:[...new Map(data.diccionario.map(d=>[d.metrica,[d.metrica,d.categoria]])).values()],etiquetas:Object.fromEntries(data.diccionario.map(d=>[d.metrica,d.pregunta])),revision:1};
  else if(route==='/panel')body=panel(fs);
  else if(route==='/explorar')body=explore(fs,u.searchParams.get('metrica'),Number(u.searchParams.get('pagina')||1));
  else if(route==='/benchmark')body={disponible:false,motivo:'Esta vista usa ocho empresas ficticias. El benchmark protegido se consulta en la aplicación con el estudio importado.'};
  else if(route==='/calidad'){
   const visible=new Set(fs.map(f=>f.empresa+'|'+f.bimestre)),issues=data.incidencias.filter(x=>visible.has(x.empresa+'|'+x.bimestre)),counts={},estados={};issues.forEach(x=>counts[x.codigo]=(counts[x.codigo]||0)+1);fs.forEach(x=>estados[x.estado]=(estados[x.estado]||0)+1);
   body={incidencias:issues,conteos:counts,estados,revision:1,perfil:[]};
  }else if(route==='/auditoria')body=[];
  else {status=400;body={detail:'Esta acción está disponible en la aplicación conectada al estudio. La vista de diseño no guarda cambios.'};}
  return {ok:status===200,status,json:async()=>body};
 };
 // Evitar enlaces a un servidor inexistente al abrir el archivo sin conexión.
 window.open=()=>{window.alert('Los reportes y las exportaciones están disponibles al ejecutar la aplicación. Esta vista contiene únicamente datos ficticios.');return null;};
 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href^="/api/"]');if(a){e.preventDefault();window.open();}});
})();
