import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePoints,validExam} from '../dist/validation.mjs';
import {score,readSheet} from '../dist/reader.mjs';
import {template50} from '../dist/template-50.mjs';
import {template200} from '../dist/template-200.mjs';
test('marks accept decimals and fractions, rejecting invalid input',()=>{
 for(const [raw,value] of [['2',2],['2/3',2/3],['.25',.25],['0',0],[' 1 / 3 ',1/3]]) assert.equal(parsePoints(raw),value);
 for(const raw of ['', '-1','1/0','Infinity','NaN','2/3/4','1e3','1001','2abc']) assert.throws(()=>parsePoints(raw));
});
test('stored configuration validates type, range and supported count',()=>{
 const valid={title:'Test',key:'A'.repeat(50),plus:2,minus:2/3};
 assert.ok(validExam(valid));
 for(const change of [{key:Array(50).fill('A')},{key:'A'.repeat(31)},{key:'X'.repeat(50)},{title:''},{plus:Infinity},{plus:0},{minus:-1},{minus:1001}]) assert.equal(validExam({...valid,...change}),false);
 assert.equal(validExam(null),false);
});
test('50 map has exactly 200 bubble positions; 30 auto reading stays blocked',()=>{
 assert.equal(template50.grid.length,50);
 assert.ok(template50.grid.every(row=>row.length===4&&row.every(p=>p.length===2&&p.every(Number.isFinite))));
 assert.throws(()=>readSheet({},[],30),/manual/);
});
for(const count of [30,50,100]) test(`${count} question score: all correct, wrong, blank, half, mixed and unresolved`,()=>{
 const key='ABCD'.repeat(25).slice(0,count);
 assert.equal(score(key,[...key],2,2/3).total,count*2);
 const wrong=[...key].map(a=>a==='A'?'B':'A');
 assert.ok(Math.abs(score(key,wrong,2,2/3).total+count*2/3)<1e-10);
 assert.equal(score(key,Array(count).fill('-'),2,2/3).total,0);
 const half=[...key].map((a,i)=>i<count/2?a:'-');
 assert.equal(score(key,half,2,2/3).attempted,count/2);
 assert.equal(score(key,half,2,2/3).total,count);
 const mixed=[...key].map((a,i)=>i%3===0?a:i%3===1?'X':'-');
 const r=score(key,mixed,1,1/3);
 assert.equal(r.correct+r.wrong+r.unanswered,count);
 assert.equal(r.attempted,r.correct+r.wrong);
 mixed[0]='?';assert.equal(score(key,mixed,1,1/3),null);
});
test('score rejects invalid data without producing misleading totals',()=>{
 for(const args of [['A',[],2,0],['?', ['A'],2,0],['A',['A'],NaN,0],['A',['A'],2,-1],['A',null,2,0],['',[],2,0]]) assert.equal(score(...args),null);
});
test('200 map has exactly 1000 bubble positions in 4 columns of 50 rows',()=>{
 assert.equal(template200.grid.length,200);
 assert.ok(template200.grid.every(row=>row.length===5&&row.every(p=>p.length===2&&p.every(Number.isFinite))));
 assert.equal(template200.anchors.length,4);
});
test('200 exam validates type, range, 5 options (A-E) and scores correctly',()=>{
 const valid200={title:'Grand Test',key:'ABCDE'.repeat(40),plus:1,minus:0.2};
 assert.ok(validExam(valid200));
 assert.equal(validExam({...valid200,key:'X'.repeat(200)}),false);
 assert.equal(validExam({...valid200,key:'A'.repeat(199)}),false);
 const key='ABCDE'.repeat(40);
 const result=score(key,[...key],1,0.2);
 assert.equal(result.total,200);
 assert.equal(result.correct,200);
 assert.equal(result.wrong,0);
 assert.equal(result.unanswered,0);
 const wrong=[...key].map(a=>a==='A'?'B':'A');
 const resultWrong=score(key,wrong,1,0.2);
 assert.equal(resultWrong.correct,0);
 assert.equal(resultWrong.wrong,200);
 assert.equal(resultWrong.total,-40);
});
