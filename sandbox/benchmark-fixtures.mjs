import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

export function missingFixtures(cases, fixturesDir){
 return cases
  .map((c)=>c.file)
  .filter((file)=>!fs.existsSync(fileURLToPath(new URL(file,fixturesDir))));
}

export function shouldSkipBenchmark(cases, fixturesDir, label, log=console){
 const missing=missingFixtures(cases,fixturesDir);
 if(!missing.length) return false;
 log.warn(`[sandbox:${label}] skipping benchmark: missing ${missing.length} fixture file(s) in ${fileURLToPath(fixturesDir)}`);
 return true;
}
