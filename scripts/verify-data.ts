import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validateOutput } from "./run-data-pipeline";
import { OUTPUT_FILES, digest, implementationHash } from "./lib/pipeline-contract";
export async function verifyData(root = "data/processed", projectRoot = process.cwd()) {
 const manifest = JSON.parse(await fs.readFile(path.join(root,"pipeline-manifest.json"),"utf8")) as {schemaVersion:number; implementationSha256:string; outputs:Record<string,string>};
 if(manifest.schemaVersion!==3||!manifest.outputs||Object.keys(manifest.outputs).sort().join("|")!==[...OUTPUT_FILES].sort().join("|"))throw new Error("Unsupported or incomplete pipeline manifest");
 if(await implementationHash(projectRoot)!==manifest.implementationSha256)throw new Error("Extraction code changed since this generation. Run npm run data:extract with the source workbook.");
 for(const file of OUTPUT_FILES) {
  const hash=digest(await fs.readFile(path.join(root,file)));
  if(hash!==manifest.outputs[file])throw new Error(`Dataset changed outside the complete pipeline: ${file}. Run npm run data:extract with the source workbook.`);
 }
 return validateOutput(root);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)verifyData().then(r=>console.log(`Data verified: ${r.records} records, ${r.periods} periods.`)).catch(e=>{console.error(e);process.exitCode=1;});
