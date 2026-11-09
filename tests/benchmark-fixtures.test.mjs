import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {pathToFileURL} from 'node:url';
import {missingFixtures,shouldSkipBenchmark} from '../sandbox/benchmark-fixtures.mjs';

test('missingFixtures returns only files absent from fixtures directory',()=>{
 const tempDir=fs.mkdtempSync(path.join(os.tmpdir(),'fixtures-'));
 fs.writeFileSync(path.join(tempDir,'present.png'),'x');
 const fixturesDir=new URL('./',pathToFileURL(tempDir.endsWith(path.sep)?tempDir:tempDir+path.sep));
 const missing=missingFixtures([{file:'present.png'},{file:'missing.png'}],fixturesDir);
 assert.deepEqual(missing,['missing.png']);
});

test('shouldSkipBenchmark warns and returns true when any fixture is missing',()=>{
 const fixturesDir=pathToFileURL(path.join(os.tmpdir(),'definitely-missing-benchmark-fixtures/'));
 const warnings=[];
 const skip=shouldSkipBenchmark([{file:'01.png'}],fixturesDir,'100-question',{warn:(msg)=>warnings.push(msg)});
 assert.equal(skip,true);
 assert.equal(warnings.length,1);
 assert.match(warnings[0],/\[sandbox:100-question\] skipping benchmark/);
});
