import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { validateOutput } from "./run-data-pipeline";
export async function verifyData(root = "data/processed") {
 const manifest = JSON.parse(await fs.readFile(path.join(root,"pipeline-manifest.json"),"utf8")) as {schemaVersion:number; outputs:Record<string,string>};
 if(manifest.schemaVersion!==2||Object.keys(manifest.outputs).length!==12)throw new Error("Unsupported or incomplete pipeline manifest");
 for(const [file,expected] of Object.entries(manifest.outputs)) {
  const hash=createHash("sha256").update(await fs.readFile(path.join(root,file))).digest("hex");
  if(hash!==expected)throw new Error(`Dataset changed outside the complete pipeline: ${file}. Run npm run data:extract with the source workbook.`);
 }
 return validateOutput(root);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)verifyData().then(r=>console.log(`Data verified: ${r.records} records, ${r.periods} periods.`)).catch(e=>{console.error(e);process.exitCode=1;});
