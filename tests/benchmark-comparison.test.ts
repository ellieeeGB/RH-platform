import test from 'node:test';
import assert from 'node:assert/strict';
import {comparisonPeers, distribution, validSalaryBands} from '../src/lib/benchmark-comparison';
import {getCompanySnapshot, completeHeadcount} from '../src/lib/company-panel';

test('Peer comparisons honor size, union, period and company exclusion',()=>{
 const all = comparisonPeers('Jul-Ago 25','all','all');
 const peers = comparisonPeers('Jul-Ago 25','under250','yes','COMPAÑIA 40');
 assert.ok(peers.length > 0 && peers.length < all.length);
 assert.ok(peers.every(row=>row.period==='Jul-Ago 25' && row.company!=='COMPAÑIA 40' && row.laborRelations.unionized===true && completeHeadcount(row)! < 250));
 assert.equal(comparisonPeers('Jul-Ago 25','all','all','COMPAÑIA 40').length,all.length-1);
 const known = getCompanySnapshot('COMPAÑIA 40','Jul-Ago 25')!;
 assert.equal(validSalaryBands({...known,salaryDaily:{entry:400,low:300,high:500,max:600}}),false);
 assert.equal(validSalaryBands({...known,salaryDaily:{entry:200,low:300,high:500,max:null}}),false);
});
test('Each benchmark requires five finite answers and interpolates quartiles',()=>{
 assert.deepEqual(distribution([null,1,2,3,4,Infinity]),{n:4,q1:null,median:null,q3:null});
 assert.deepEqual(distribution([50,10,40,20,30]),{n:5,q1:20,median:30,q3:40});
 assert.deepEqual(distribution([10,20,30,40,50,60]),{n:6,q1:22.5,median:35,q3:47.5});
});
