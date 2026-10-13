import ExcelJS from 'exceljs';
import fs from 'node:fs/promises';
const cuts = [['JUL-AGO_2024','Jul-Ago 24','2024-07'],['SEP-OCT_2024','Sep-Oct 24','2024-09'],['NOV-DIC_2024','Nov-Dic 24','2024-11'],['ENE-FEB_2025','Ene-Feb 25','2025-01'],['MAR-ABR_2025','Mar-Abr 25','2025-03'],['MAY-JUN_2025','May-Jun 25','2025-05'],['JUL-AGO_2025','Jul-Ago 25','2025-07']];
const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
const salary=(v:unknown)=>{const n=num(v);return n!==null&&n>0?n:null;};
async function main(){
 const workbook=new ExcelJS.Workbook();await workbook.xlsx.readFile(process.argv[2]??'data/raw/BASE HISTORICA(1).xlsx');
 const periods=[],records=[];
 for(const [sheetName,label,id] of cuts){
  const sheet=workbook.getWorksheet(sheetName);if(!sheet)throw new Error(`Missing sheet: ${sheetName}`);
  if(sheet.getCell('IC2').text!=='Técnico de Mantenimiento'||!sheet.getCell('KQ2').text.includes('Gerencial'))throw new Error(`Changed headers: ${sheetName}`);
  const monthlyAvailable=id.endsWith('-07')&&/julio/i.test(sheet.getCell('LC2').text)&&/agosto/i.test(sheet.getCell('LD2').text);
  const months=[0,1].map(offset=>{const date=new Date(`${id}-01T00:00:00Z`);date.setUTCMonth(date.getUTCMonth()+offset);const name=new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric',timeZone:'UTC'}).format(date).replace(' de ',' ');return {id:date.toISOString().slice(0,7),label:name[0].toUpperCase()+name.slice(1)};});
  periods.push({id,label,monthlyAvailable,months});
  for(let row=3;row<=42;row++){
   const company=sheet.getCell(`F${row}`).text.trim();if(!/^COMPAÑIA \d+$/.test(company))throw new Error(`Invalid company at ${sheetName}:${row}`);
   const statuses=Object.fromEntries(['ttfOperational','ttfTechnical','ttfAdministrative','ttfManagerial'].map((key,i)=>{const raw=sheet.getCell(row,300+i).value,n=num(raw);return [key+'Status',n!==null&&n>0?'exact':n===0?'not-applicable':/m[aá]s de 60/i.test(String(raw))?'over-60':'missing'];}));
   const technicalRoles=Array.from({length:11},(_,i)=>({name:sheet.getCell(2,237+i).text.trim(),minimum:salary(sheet.getCell(row,237+i).value),average:salary(sheet.getCell(row,250+i).value),maximum:salary(sheet.getCell(row,263+i).value),people:num(sheet.getCell(row,276+i).value)})).filter(r=>r.minimum!==null||r.average!==null||r.maximum!==null||(r.people??0)>0);
   records.push({company,period:label,monthlyExits1:monthlyAvailable?num(sheet.getCell(`LC${row}`).value):null,monthlyExits2:monthlyAvailable?num(sheet.getCell(`LD${row}`).value):null,...statuses,technicalRoles});
  }
 }
 await fs.writeFile(`${process.env.CATCH_DATA_OUTPUT ?? 'data/processed'}/company-detail.json`,JSON.stringify({periods,records})+'\n');console.log(`Extracted ${records.length} company-period records.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
