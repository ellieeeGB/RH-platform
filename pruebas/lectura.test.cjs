const {test}=require('node:test');
const assert=require('node:assert/strict');
const L=require('../web/lectura.js');
const row=(empresa,bimestre,plantilla,bajas,contrataciones)=>({empresa,bimestre,plantilla,bajas,contrataciones,rotacion:plantilla>0&&bajas!==null?100*bajas/plantilla:null,balance:bajas!==null&&contrataciones!==null?contrataciones-bajas:null});
test('El titular usa solo empresas con altas y bajas, sin imputar faltantes',()=>{
 const rs=[row('A','2025-07',100,10,3),row('B','2025-07',50,null,80)];
 const r=L.lectura({bimestre:'2025-07'},rs);
 assert.equal(r.balance,-7);assert.equal(r.n,1);assert.equal(r.altas,3);assert.match(r.titulo,/bajas superan/);
});
test('Un balance cero es un dato válido y no un faltante',()=>{
 assert.equal(L.lectura({bimestre:'2025-07'},[row('A','2025-07',10,0,0)]).balance,0);
 assert.equal(L.lectura({bimestre:'2025-07'},[]).balance,null);
});
test('La evolución mantiene la misma cohorte y pondera rotación por plantilla',()=>{
 const rs=[row('A','2025-05',100,10,20),row('A','2025-07',200,10,15),row('B','2025-05',100,40,40),row('C','2025-05',100,10,10),row('C','2025-07',100,20,30)];
 const r=L.evolucion(rs,['2025-05','2025-07'],'rotacion');
 assert.equal(r.n,2);assert.equal(r.puntos[0].valor,10);assert.equal(r.puntos[1].valor,10);
});
test('La comparación no une una serie sin datos completos',()=>{
 const r=L.evolucion([row('A','2025-05',100,10,5)],['2025-05','2025-07'],'rotacion');
 assert.equal(r.n,0);assert.deepEqual(r.puntos.map(x=>x.valor),[null,null]);
});
test('Sensibilidad retira una empresa de un bimestre sin mutar la fuente',()=>{
 const rs=[row('A','2025-07',1000,10,20),row('B','2025-07',100,10,10),row('A','2025-05',100,10,5)];
 const original=JSON.stringify(rs),r=L.sensibilidad(rs,'A','2025-07');
 assert.equal(r.antes.n,2);assert.equal(r.antes.tasa,100*20/1100);assert.equal(r.despues.tasa,10);assert.equal(r.despues.n,1);assert.equal(JSON.stringify(rs),original);
});
test('Excluir la única empresa deja tasa desconocida, nunca cero',()=>{
 assert.equal(L.sensibilidad([row('A','2025-07',100,10,5)],'A','2025-07').despues.tasa,null);
});
test('Mapa distingue cero, faltante y signo; mediana conserva ceros',()=>{
 assert.equal(L.intensidad(null,[0,20]),'sin-dato');assert.equal(L.intensidad(0,[0,20]),'positivo-0');assert.equal(L.intensidad(-20,[0,-20]),'negativo-4');assert.equal(L.mediana([0,10,null]),5);assert.equal(L.mediana([]),null);
});
test('Cambios nulos no se presentan como estabilidad',()=>{
 assert.equal(L.cambio({anterior:{cambio_pp:null,n_pareadas:0}}),null);
 assert.equal(L.cambio({anterior:{cambio_pp:0,n_pareadas:4,bimestre:'2025-05'}}).valor,0);
});
