import {parsePoints, validExam} from './validation.mjs';
import {findAnchors, readSheet, score} from './reader.mjs';

const $=id=>document.getElementById(id);
const status=message=>{$('status').textContent=message;};
const storageKey='tgmsc-omr-pilot-v1';
const canvas=$('sheet'), context=canvas.getContext('2d',{willReadFrequently:true});
const marksFormat=new Intl.NumberFormat('en-IN',{maximumFractionDigits:2});
const corners=['upper left','upper right','lower right','lower left'];
const getOptions=()=>exam&&exam.key.length===200?[['?','Needs review'],['A','A'],['B','B'],['C','C'],['D','D'],['E','E'],['-','Unanswered'],['X','Wrong / invalid']]:[['?','Needs review'],['A','A'],['B','B'],['C','C'],['D','D'],['-','Unanswered'],['X','Wrong / invalid']];
let exam=null, draft=null, frame=null, points=[], readings=[], answers=[];
let photoVersion=0, manual=false, overlay=true;

function tile(text){
 const element=document.createElement('div');
 element.className='tile';
 element.textContent=text;
 return element;
}
function begin(config){
 exam={...config,plusText:String(config.plusText ?? config.plus),minusText:String(config.minusText ?? config.minus)};
 config=exam;
 $('setup').hidden=true;
 $('work').hidden=false;
 $('active').textContent=config.title+' · '+config.key.length+' questions';
 $('rules').textContent='Correct +'+(config.plusText??config.plus)+' · Wrong / invalid −'+(config.minusText??config.minus)+' · Blank 0';
 status('');
}
$('exam').addEventListener('input',()=>{$('preview').hidden=true;draft=null;});
$('exam').addEventListener('submit',event=>{
 event.preventDefault();
 try{
  const key=$('key').value.toUpperCase().replace(/[\s,]+/g,'');
  const title=$('title').value.trim();
  if(!title) throw Error('Enter an exam name.');
  const is200=$('layout').value==='200';
  if(key.length!==Number($('layout').value)||!(is200?/^[ABCDE]+$/:/^[ABCD]+$/).test(key)) throw Error('Enter exactly '+$('layout').value+' answers using A, B, C'+(is200?', D or E.':' or D.'));
  const plus=parsePoints($('plus').value), minus=parsePoints($('minus').value);
  if(plus<=0) throw Error('Marks per correct answer must be positive.');
  draft={title,key,plus,minus,plusText:$('plus').value.trim(),minusText:$('minus').value.trim()};
  $('keygrid').replaceChildren(...Array.from(key,(a,i)=>tile((i+1)+'. '+a)));
  $('preview').hidden=false;
  status('');
 }catch(error){status(error.message);}
});
$('start').onclick=()=>{
 if(!draft) return;
 begin(draft);
 try{localStorage.setItem(storageKey,JSON.stringify(draft));}catch{status('Exam settings could not be saved to this browser.');}
};
function clearSheet(){
 photoVersion++;
 frame=null;points=[];readings=[];answers=[];manual=false;overlay=true;
 canvas.width=1;canvas.height=1;
 for(const id of ['photo','review','result']) $(id).hidden=true;
 $('verified').checked=false;
 $('rows').replaceChildren();
 $('totals').replaceChildren();
 $('guide').textContent='';
 $('overlay').hidden=true;
 status('');
}
$('newexam').onclick=()=>{
 if(frame&&!confirm('Return to exam setup? The current sheet and result will be cleared.')) return;
 const config=exam;
 clearSheet();draft=null;
 $('work').hidden=true;$('setup').hidden=false;$('preview').hidden=true;
 $('title').value=config.title;
 $('layout').value=String(config.key.length);
 $('plus').value=config.plusText??String(config.plus);
 $('minus').value=config.minusText??String(config.minus);
 $('key').value=config.key;
 updateFormHelp();$('title').focus();
};
$('next').onclick=()=>{clearSheet();$('gallery').focus();};
function draw(){
 context.putImageData(frame,0,0);
 context.lineWidth=Math.max(2,canvas.width/440);
 context.strokeStyle='#1fc89c';
 for(const [x,y] of (overlay?points:[])){context.beginPath();context.arc(x,y,8,0,2*Math.PI);context.stroke();}
 for(const {points:row} of (overlay?readings:[])){
  for(const [x,y] of row){context.beginPath();context.arc(x,y,5,0,2*Math.PI);context.stroke();}
 }
 const i=points.length;
 $('read').disabled=i!==4;
 $('undo').disabled=i===0;
 $('align').hidden=!manual;
 $('manual').hidden=exam.key.length===30||manual;
 $('reviewLink').hidden=!answers.length;
 $('overlay').hidden=!readings.length;
 $('overlay').setAttribute('aria-pressed',String(overlay));
 $('overlay').textContent=overlay?'Hide overlay':'Show overlay';
 $('guide').textContent=exam.key.length===30?'Read each answer from the photo and enter it below.'
  :readings.length?'Check that the green circles sit inside the printed bubbles, then review the answers.'
  :!manual?'The four printed corner marks could not be found reliably. Retake the full sheet in even light, or align it manually.'
  :i===4?'Select Read bubbles to continue.'
  :(exam.key.length===200&&i<2?'Tap the '+corners[i]+' corner of the printed answer-grid border box ('+(i+1)+'/4).':'Tap the small printed black mark near the '+corners[i]+' of the form ('+(i+1)+'/4). These marks sit outside the answer grid.');
}
async function loadPhoto(input){
 const file=input.files[0];input.value='';
 if(!file) return;
 if(file.size>25*1024*1024){status('This photo is larger than 25 MB. Use a smaller JPEG or PNG.');return;}
 if(frame&&$('result').hidden&&answers.length&&!confirm('Replace the current student sheet and its review?')) return;
 clearSheet();
 status('Reading photo…');
 const version=photoVersion;
 const url=URL.createObjectURL(file);
 try{
  const photo=new Image();
  photo.src=url;
  await photo.decode();
  if(version!==photoVersion) return;
  if(photo.width*photo.height>60000000) throw Error('This photo is too large to process comfortably. Use your camera’s standard resolution.');
  if(Math.min(photo.width,photo.height)<600) throw Error('The photo is too small. Capture the entire sheet at normal camera resolution.');
  const scale=Math.min(1,2000/Math.max(photo.width,photo.height));
  canvas.width=Math.round(photo.width*scale);
  canvas.height=Math.round(photo.height*scale);
  context.drawImage(photo,0,0,canvas.width,canvas.height);
  frame=context.getImageData(0,0,canvas.width,canvas.height);
  $('photo').hidden=false;
  if(exam.key.length!==30){
   points=findAnchors(frame,exam.key.length)??[];
   if(points.length===4) evaluatePhoto();
   else {draw();status('');}
  }else{
   answers=Array(exam.key.length).fill('?');draw();openReview();status('');
  }
 }catch(error){if(version===photoVersion) status(error.message||'Could not read this image. Try a JPEG or PNG.');}
 finally{URL.revokeObjectURL(url);}
}
for(const id of ['camera','gallery']) $(id).onchange=()=>loadPhoto($(id));
canvas.onclick=event=>{
 if(!frame||!manual||points.length===4) return;
 const rect=canvas.getBoundingClientRect();
 points.push([(event.clientX-rect.left)*canvas.width/rect.width,(event.clientY-rect.top)*canvas.height/rect.height]);
 draw();
};
$('undo').onclick=()=>{
 points.pop();readings=[];answers=[];
 $('review').hidden=true;$('result').hidden=true;status('');draw();
};
$('manual').onclick=()=>{
 if(answers.length&&!confirm('Realigning will reset the answers for this sheet. Continue?')) return;
 manual=true;overlay=true;points=[];readings=[];answers=[];
 $('review').hidden=true;$('result').hidden=true;status('');draw();
 $('guide').scrollIntoView({block:'nearest'});
};
$('overlay').onclick=()=>{overlay=!overlay;draw();};
$('backPhoto').onclick=()=>$('photo').scrollIntoView({block:'start'});
function showConfirmation(){
 $('confirmArea').focus({preventScroll:true});
 $('confirmArea').scrollIntoView({block:'start'});
}
$('goConfirm').onclick=showConfirmation;
$('reviewLink').onclick=showReview;
function showReview(){ $('review').focus({preventScroll:true});$('review').scrollIntoView({block:'start'}); }
$('read').onclick=evaluatePhoto;
function evaluatePhoto(){
 try{
  readings=readSheet(frame,points,exam.key.length);
  answers=readings.map(row=>row.answer);
  draw();openReview();status('');showReview();
 }catch(error){
  readings=[];answers=[];$('review').hidden=true;$('result').hidden=true;
  draw();$('guide').textContent=error.message;status('');
 }
}
function openReview(){
 $('verified').checked=false;
 $('filter').value=readings.length?'pending':'all';
 $('review').hidden=false;
 $('result').hidden=true;
 renderRows();
}
function cropFor(bubbles,index){
 const xs=bubbles.map(([x])=>x),ys=bubbles.map(([,y])=>y);
 const pad=Math.max(12,(Math.max(...xs)-Math.min(...xs))/5);
 const left=Math.floor(Math.min(...xs)-pad),top=Math.floor(Math.min(...ys)-pad);
 const crop=document.createElement('canvas');
 crop.width=Math.ceil(Math.max(...xs)-left+pad);crop.height=Math.ceil(Math.max(...ys)-top+pad);
 crop.setAttribute('aria-label','Photo crop for question '+(index+1));
 crop.getContext('2d').putImageData(frame,-left,-top);
 return crop;
}
function renderRows(){
 const filter=$('filter').value;
 const rows=answers.map((answer,index)=>{
  const key=exam.key[index];
  if(filter==='pending'&&answer!=='?') return null;
  if(filter==='wrong'&&!('ABCDEX'.includes(answer)&&answer!==key)) return null;
  const row=document.createElement('div');row.className='row';row.setAttribute('data-question',String(index));
  const text=tile('Q'+(index+1)+' · '+(answer==='?'?'Unresolved':answer==='-'?'Unanswered':answer===key?'Correct':'Wrong')+(answer==='?'?'':' · Key '+key));
  const change=value=>{
   answers[index]=value;
   $('verified').checked=false;
   renderRows();
   if(filter==='pending'){
    const next=$('rows').querySelector('button');
    if(next){next.focus({preventScroll:true});next.scrollIntoView({block:'nearest'});}
    else showConfirmation();
   }else{
    const edited=$('rows').querySelector('[data-question="'+index+'"] select');
    edited?.focus({preventScroll:true});
   }
  };
  const bubbles=readings[index]?.points;
  if(filter==='pending'&&bubbles){
   row.classList.add('quick-review');
   const choices=document.createElement('div');choices.className='answer-buttons';
   for(const [value,label] of getOptions().slice(1)){
    const button=document.createElement('button');button.type='button';
    button.className='secondary';button.textContent=value==='-'?'Blank':value==='X'?'Invalid':label;
    button.setAttribute('aria-label','Question '+(index+1)+': '+label);
    button.onclick=()=>change(value);choices.append(button);
   }
   row.append(text,cropFor(bubbles,index),choices);
   return row;
  }
  const select=document.createElement('select');select.setAttribute('aria-label','Question '+(index+1)+' response');
  for(const [value,label] of getOptions()) select.add(new Option(label,value,value===answer,value===answer));
  select.onchange=()=>change(select.value);
  row.append(text,select);
  if(bubbles){
   const show=document.createElement('button');show.className='secondary';show.textContent='Show bubbles';show.type='button';
   show.onclick=()=>show.replaceWith(cropFor(bubbles,index));
   row.append(show);
  }
  return row;
 }).filter(Boolean);
 $('rows').replaceChildren(...rows);
 updateReview();
}
function updateReview(){
 const count=answers.filter(a=>a==='?').length;
 $('pending').textContent=count?count+' response'+(count===1?'':'s')+' need review.':'All responses have a value. Check the sheet before confirming.';
 const result=score(exam.key,answers,exam.plus,exam.minus);
 $('provisional').textContent=result?'Provisional score: '+marksFormat.format(result.total)+' · '+result.correct+' correct · '+result.wrong+' wrong · '+result.unanswered+' blank':'Resolve all flagged answers to see the provisional score.';
 $('confirmArea').hidden=count!==0;
 $('goConfirm').hidden=count!==0;
 $('finish').disabled=count!==0||!$('verified').checked;
}
$('filter').onchange=renderRows;
$('verified').onchange=updateReview;
$('editResult').onclick=()=>{
 draw();openReview();showReview();
};
$('finish').onclick=()=>{
 const result=score(exam.key,answers,exam.plus,exam.minus);
 if(!result||!$('verified').checked) return;
 const fields=[['Attempted',result.attempted],['Correct',result.correct],['Wrong',result.wrong],['Unanswered',result.unanswered],['Deducted',result.negative],['Final score',result.total]];
 $('totals').replaceChildren(...fields.map(([name,value])=>tile(name+': '+marksFormat.format(value))));
 $('review').hidden=true;
 for(const id of ['align','manual','reviewLink','overlay']) $(id).hidden=true;
 $('result').hidden=false;
 $('result').scrollIntoView({block:'nearest'});
};
try{
 const saved=JSON.parse(localStorage.getItem(storageKey));
 if(validExam(saved)) { for(const [textKey,valueKey] of [['plusText','plus'],['minusText','minus']]) {
   try { if(typeof saved[textKey]!=='string'||parsePoints(saved[textKey])!==saved[valueKey]) delete saved[textKey]; }
   catch { delete saved[textKey]; }
  } begin(saved); }
}catch{}

function updateFormHelp(){
 const count=$('layout').value;
 $('keyHint').textContent='Enter exactly '+count+' answers: '+(count==='200'?'A, B, C, D or E':'A, B, C or D')+' in question order. Spaces, commas and line breaks are allowed. Do not include question numbers. Image answer keys are not supported; type or paste the verified key.';
 $('formHint').textContent=count==='30'?'30-question sheets: enter each student response manually from the photo. Automatic reading is not available yet.':count==='50'?'50-question photo reading uses a reconstructed reference. Check the overlay and all readings carefully during the pilot.':count==='200'?'200-question photo reading supports the TGMSC 5-option grand test layout.':'100-question photo reading supports the supplied TGMSC layout. Other layouts may not match.';
}
$('layout').addEventListener('change',updateFormHelp);
$('forget').onclick=()=>{
 try{localStorage.removeItem(storageKey);status('Saved exam settings removed. The current exam stays open until you leave this tab.');}
 catch{status('Browser storage is unavailable. You can clear site data in your browser settings.');}
};
updateFormHelp();