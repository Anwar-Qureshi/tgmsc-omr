import test from 'node:test';
import assert from 'node:assert/strict';
import {anchors,findAnchors,grid,projection,readSheet,score} from '../dist/reader.mjs';

test('template maps all 400 bubbles and preserves the question column order',()=>{
 assert.equal(grid.length,100);
 assert.ok(grid.every(row=>row.length===4));
 assert.ok(grid[20][0][0]>grid[19][0][0]);
 assert.ok(grid[20][0][1]<grid[19][0][1]);
});

test('reads known marks in a perspective-shifted image and flags a double mark',()=>{
 const width=1200,height=1600;
 const frame={width,height,data:new Uint8ClampedArray(width*height*4).fill(245)};
 const corners=[[100,110],[1050,195],[1040,1450],[160,1315]];
 const map=projection(anchors,corners);
 for(const row of grid) for(const [x,y] of row){
  for(let i=0;i<100;i++){
   const angle=i*2*Math.PI/100;
   const [u,v]=map([x+8*Math.cos(angle),y+8*Math.sin(angle)]).map(Math.round);
   frame.data.fill(90,(v*width+u)*4,(v*width+u)*4+3);
  }
 }
 function dot(position){
  const [x,y]=map(position).map(Math.round);
  for(let dy=-5;dy<=5;dy++) for(let dx=-5;dx<=5;dx++){
   if(dx*dx+dy*dy<=25) frame.data.fill(30,((y+dy)*width+x+dx)*4,((y+dy)*width+x+dx)*4+3);
  }
 }
 const expected=Array(100).fill('-');
 for(const q of [0,4,5,19,20,39,50,79,80,99]){
  const option=q%4;dot(grid[q][option]);expected[q]='ABCD'[option];
 }
 dot(grid[45][1]);dot(grid[45][2]);expected[45]='?';
 assert.deepEqual(readSheet(frame,corners).map(row=>row.answer),expected);
 assert.throws(()=>readSheet(frame,[corners[0],corners[2],corners[1],corners[3]]));
 assert.throws(()=>readSheet(frame,corners.map(([x,y])=>[x+10,y])),/answer grid|not readable/);
 assert.throws(()=>readSheet({...frame,data:new Uint8ClampedArray(width*height*4).fill(240)},corners),/answer grid/);
});

test('scores blanks, invalid responses and negative marks; blocks unresolved answers',()=>{
 assert.deepEqual(score('ABCDA',['A','B','D','-','X'],2,.5),{
  attempted:4,correct:2,wrong:2,unanswered:1,negative:1,total:3
 });
 assert.equal(score('A',['?'],2,2/3),null);
 assert.equal(score('A',['B'],2,2/3).total,-2/3);
});

test('auto alignment finds isolated squares, rejects missing markers and rejects taps on adjacent bubbles',()=>{
 const width=1000,height=1300;
 const frame={width,height,data:new Uint8ClampedArray(width*height*4).fill(240)};
 const markers=[[135,140],[805,120],[896,1040],[124,1095]];
 const square=([x,y],value)=>{
  for(let j=y-3;j<=y+3;j++){
   frame.data.fill(value,(j*width+x-3)*4,(j*width+x+4)*4);
  }
 };
 for(const point of markers) square(point,28);
 for(const point of [[265,505],[280,525],[300,545],[320,565]]) square(point,25);
 assert.deepEqual(findAnchors(frame),markers);
 square(markers[2],240);
 assert.equal(findAnchors(frame),null);
 assert.throws(()=>readSheet(frame,[[265,505],[280,525],[300,545],[320,565]]),/printed squares/);
});

test('reads known marks in a perspective-shifted 200-question image and handles 5 options (A-E)',async()=>{
 const {template200}=await import('../dist/template-200.mjs');
 const width=1200,height=1600;
 const frame={width,height,data:new Uint8ClampedArray(width*height*4).fill(245)};
 const corners=[[80,210],[1070,200],[1080,1420],[75,1440]];
 const map=projection(template200.anchors,corners);
 for(const row of template200.grid) for(const [x,y] of row){
  for(let i=0;i<100;i++){
   const angle=i*2*Math.PI/100;
   const [u,v]=map([x+8*Math.cos(angle),y+8*Math.sin(angle)]).map(Math.round);
   frame.data.fill(90,(v*width+u)*4,(v*width+u)*4+3);
  }
 }
 function dot(position){
  const [x,y]=map(position).map(Math.round);
  for(let dy=-5;dy<=5;dy++) for(let dx=-5;dx<=5;dx++){
   if(dx*dx+dy*dy<=25) frame.data.fill(30,((y+dy)*width+x+dx)*4,((y+dy)*width+x+dx)*4+3);
  }
 }
 const expected=Array(200).fill('-');
 for(const q of [0,4,9,19,49,50,99,100,149,150,199]){
  const option=q%5;dot(template200.grid[q][option]);expected[q]='ABCDE'[option];
 }
 dot(template200.grid[45][1]);dot(template200.grid[45][2]);expected[45]='?';
 const answers=readSheet(frame,corners,200).map(row=>row.answer);
 assert.deepEqual(answers,expected);

 const bl=[75,1440], br=[1080,1420];
 const square=([x,y],value)=>{
  for(let j=y-3;j<=y+3;j++){
   frame.data.fill(value,(j*width+x-3)*4,(j*width+x+4)*4);
  }
 };
 square(bl,25);square(br,25);
 const detected=findAnchors(frame,200);
 assert.ok(detected,'findAnchors must locate 200-question anchors');
 assert.equal(detected.length,4);
 assert.ok(Math.hypot(detected[2][0]-br[0],detected[2][1]-br[1])<5);
 assert.ok(Math.hypot(detected[3][0]-bl[0],detected[3][1]-bl[1])<5);
});
