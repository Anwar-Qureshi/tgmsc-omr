import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {findAnchors,readSheet,score} from '../../dist/reader.mjs';

const {key,cases}=JSON.parse(fs.readFileSync(new URL('./cases.json',import.meta.url)));
let accepted=0, rejected=0, total=0, reviewed=0;
const python = process.platform === 'win32' ? 'python' : 'python3';
for(const c of cases){
 const path=fileURLToPath(new URL('./fixtures/'+c.file,import.meta.url));
 const data=execFileSync(python,['-c','from PIL import Image; import sys; sys.stdout.buffer.write(Image.open(sys.argv[1]).convert("RGBA").tobytes())',path],{maxBuffer:20*1024*1024});
 const frame={data,width:1200,height:1600};
 assert.equal(data.length,frame.width*frame.height*4);
 let answers;
 try{
  const anchors=findAnchors(frame,50);
  if(anchors) answers=readSheet(frame,anchors,50).map(row=>row.answer);
 }catch(error){
  if(!/answer grid|not readable|printed squares/.test(error.message)) throw error;
 }
 if(c.expect==='reject'){
  assert.equal(answers,undefined,c.file+' must block grading');rejected++;continue;
 }
 assert.ok(answers,c.file+' must reach review');accepted++;
 for(const q of c.requiredFlags??[]) assert.equal(answers[q-1],'?',c.file+' Q'+q);
 answers.forEach((a,i)=>{
  if(a==='?') reviewed++;
  else assert.equal(a,c.answers[i],c.file+' Q'+(i+1)+' silent mismatch');
 });
 total+=answers.length;
 const result=score(key,answers.map((a,i)=>a==='?'?c.answers[i]:a),1,1/3);
 assert.deepEqual(result,score(key,[...c.answers],1,1/3),c.file+' score after review');
}
console.log({accepted,rejected,total,reviewed,automatic:total-reviewed,silentErrors:0});
