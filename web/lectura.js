/* Reglas descriptivas compartidas por las vistas. Sin predicción ni puntuaciones opacas. */
(function (root) {
  'use strict';
  const valid = value => typeof value === 'number' && Number.isFinite(value);
  function lectura(point, rows) {
    const matched = rows.filter(r => r.bimestre === point.bimestre && valid(r.contrataciones) && valid(r.bajas));
    const altas = matched.reduce((s, r) => s + r.contrataciones, 0);
    const bajas = matched.reduce((s, r) => s + r.bajas, 0);
    const balance = matched.length ? altas - bajas : null;
    const titulo = balance === null ? 'Falta completar el balance del bimestre.'
      : balance < 0 ? 'Las bajas superan a las contrataciones.'
      : balance > 0 ? 'Las contrataciones superan a las bajas.'
      : 'Contrataciones y bajas están en equilibrio.';
    return {titulo, altas: matched.length ? altas : null, bajas: matched.length ? bajas : null,
      balance, n: matched.length, total: rows.filter(r => r.bimestre === point.bimestre).length};
  }
  function cambio(point, tipo = 'anterior') {
    const c = point[tipo];
    if (!c || !valid(c.cambio_pp) || !c.n_pareadas) return null;
    return {valor:c.cambio_pp, n:c.n_pareadas, periodo:c.bimestre};
  }
  function mediana(values) {
    const a = values.filter(valid).sort((a,b) => a-b), n=a.length;
    return n ? (a[Math.floor(n/2)]+a[Math.floor((n-1)/2)])/2 : null;
  }
  function intensidad(value, values) {
    if (!valid(value)) return 'sin-dato';
    const max = Math.max(0, ...values.filter(valid).map(Math.abs));
    const level = max === 0 ? 0 : Math.min(4, Math.ceil(Math.abs(value)/max*4));
    return `${value < 0 ? 'negativo' : 'positivo'}-${level}`;
  }
  // Cada serie usa una cohorte fija; un faltante rompe la comparación, nunca se convierte en cero.
  function evolucion(rows, periods, key) {
    const companies = [...new Set(rows.map(r=>r.empresa))];
    const index = new Map(rows.map(r=>[r.empresa+'|'+r.bimestre,r]));
    const comunes = companies.filter(e=>periods.every(p=>{
      const r=index.get(e+'|'+p);
      return r && valid(r[key]) && (key!=='rotacion'||(valid(r.plantilla)&&r.plantilla>0&&valid(r.bajas)));
    }));
    return {n:comunes.length, puntos:periods.map(p=>{
      const rs=comunes.map(e=>index.get(e+'|'+p));
      const valor=!rs.length?null:key==='rotacion'?100*rs.reduce((s,r)=>s+r.bajas,0)/rs.reduce((s,r)=>s+r.plantilla,0):rs.reduce((s,r)=>s+r[key],0);
      return {bimestre:p,valor};
    })};
  }
  function sensibilidad(rows, empresa, bimestre) {
    const base=rows.filter(r=>r.bimestre===bimestre && valid(r.rotacion) && valid(r.bajas) && valid(r.plantilla) && r.plantilla>0);
    const resumen=rs=>{
      const denominador=rs.reduce((s,r)=>s+r.plantilla,0),bajas=rs.reduce((s,r)=>s+r.bajas,0);
      return {n:rs.length,denominador,bajas,tasa:denominador?100*bajas/denominador:null};
    };
    return {antes:resumen(base),despues:resumen(base.filter(r=>r.empresa!==empresa))};
  }
  const api={valid,lectura,cambio,mediana,intensidad,evolucion,sensibilidad};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.RHLectura=api;
})(typeof window==='undefined'?globalThis:window);
