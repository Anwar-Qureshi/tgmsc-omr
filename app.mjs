import {parsePoints} from './validation.mjs';
import {findAnchors, readSheet, score} from './reader.mjs';

const $=id=>document.getElementById(id);
const status=message=>{$('status').textContent=message;};
const storageKey='tgmsc-omr-pilot-v1';
const canvas=$('sheet'), context=canvas.getContext('2d',{willReadFrequently:true});
const marksFormat=new Intl.NumberFormat('en-IN',{maximumFractionDigits:2});
const corners=['upper left','upper right','lower right','lower left'];
const options=[['?','Needs checking'],['A','A'],['B','B'],['C','C'],['D','D'],['-','No answer'],['X','Invalid / count as wrong']];
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
 $('rules').textContent='Correct +'+(config.plusText??config.plus)+' · Wrong / invalid −'+(config.minusText??config.minus)+' · No answer 0';
 status('');
}
$('exam').addEventListener('input',()=>{$('preview').hidden=true;draft=null;});
$('exam').addEventListener('submit',event=>{
 event.preventDefault();
 try{
  const key=$('key').value.toUpperCase().replace(/[\s,]+/g,'');
  const title=$('title').value.trim();
  if(!title) throw Error('Enter an exam name.');
  if(key.length!==Number($('layout').value)||!/^[ABCD]+$/.test(key)) throw Error('Enter exactly '+$('layout').value+' answers using A, B, C or D.');
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
$('editexam').onclick=()=>{
 if(frame&&!confirm('Edit the exam settings and answer key? The current student’s photo and result will be cleared.')) return;
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
 $('overlay').textContent=overlay?'Hide green circles':'Show green circles';
 $('guide').textContent=exam.key.length===30?'This sheet needs manual entry. Read each student answer from the photo and select it below.'
  :readings.length?'Check that every green circle is inside its printed answer bubble. If they do not line up, retake the photo or choose Set corner marks. Then check the answers below.'
  :!manual?'The four printed corner marks could not be found. Retake the whole sheet in even light, or choose Set corner marks.'
  :i===4?'All four marks are selected. Choose Read answers.'
  :'Tap the small printed black mark near the '+corners[i]+' of the form ('+(i+1)+'/4). These marks sit outside the answer grid.';
}
async function loadPhoto(input){
 const file=input.files[0];input.value='';
 if(!file) return;
 if(file.size>25*1024*1024){status('This photo is larger than 25 MB. Use a smaller JPEG or PNG.');return;}
 if(frame&&$('result').hidden&&answers.length&&!confirm('Replace the current student sheet and its review?')) return;
 clearSheet();
 status('Reading the photo. Please wait…');
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
 if(answers.length&&!confirm('Selecting corner marks again will clear the answers you have checked for this sheet. Continue?')) return;
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
  if(filter==='wrong'&&!('ABCDX'.includes(answer)&&answer!==key)) return null;
  const row=document.createElement('div');row.className='row';row.setAttribute('data-question',String(index));
  const text=tile('Q'+(index+1)+' · '+(answer==='?'?'Needs checking':answer==='-'?'No answer':answer===key?'Correct':'Wrong')+(answer==='?'?'':' · Key '+key));
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
   for(const [value,label] of options.slice(1)){
    const button=document.createElement('button');button.type='button';
    button.className='secondary';button.textContent=value==='-'?'No answer':value==='X'?'Count as wrong':label;
    button.setAttribute('aria-label','Question '+(index+1)+': '+label);
    button.onclick=()=>change(value);choices.append(button);
   }
   row.append(text,cropFor(bubbles,index),choices);
   return row;
  }
  const select=document.createElement('select');select.setAttribute('aria-label','Question '+(index+1)+' response');
  for(const [value,label] of options) select.add(new Option(label,value,value===answer,value===answer));
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
 $('pending').textContent=count?count+' answer'+(count===1?' needs':'s need')+' checking.':'No answers are waiting for a decision. Choose All questions and check the answers against the sheet before confirming.';
 const result=score(exam.key,answers,exam.plus,exam.minus);
 $('provisional').textContent=result?'Score before confirmation: '+marksFormat.format(result.total)+' · '+result.correct+' correct · '+result.wrong+' wrong · '+result.unanswered+' unanswered':'Check the remaining uncertain answers to see the score.';
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
 const fields=[['Attempted',result.attempted],['Correct',result.correct],['Wrong',result.wrong],['Unanswered',result.unanswered],['Marks deducted',result.negative],['Final score',result.total]];
 $('totals').replaceChildren(...fields.map(([name,value])=>tile(name+': '+marksFormat.format(value))));
 $('review').hidden=true;
 for(const id of ['align','manual','reviewLink','overlay']) $(id).hidden=true;
 $('result').hidden=false;
 $('result').scrollIntoView({block:'nearest'});
};
function freshSetup(){
 clearSheet();exam=null;draft=null;
 $('exam').reset();
 // Explicitly clear values as browsers may restore fields on navigation.
 for(const id of ['title','plus','minus','key']) $(id).value='';
 $('layout').value='100';
 $('work').hidden=true;$('setup').hidden=false;$('preview').hidden=true;
 $('keygrid').replaceChildren();$('active').textContent='';$('rules').textContent='';
 updateFormHelp();
}
$('newexam').onclick=()=>{
 if(!confirm('Start a new exam? The current exam, answer key, sheet and result will be cleared.')) return;
 freshSetup();$('title').focus();
};
// Remove legacy saved settings; exams now live only in this open tab.
try{localStorage.removeItem(storageKey);}catch{}
// Also start clean when the browser restores this page from its back/forward cache.
window.addEventListener('pageshow',event=>{if(event.persisted) freshSetup();});

function updateFormHelp(){
 const count=$('layout').value;
 $('keyHint').textContent='Type or paste exactly '+count+' answers using A, B, C or D. Separate them with spaces, commas or new lines. Leave out question numbers. Answer-key photos cannot be read.';
 $('formHint').textContent=count==='30'?'30 questions: you will enter each student answer yourself after adding the photo. The app will calculate the score.':count==='50'?'50 questions: this trial reader uses a layout recreated from a marked sheet. Check the green circles and every answer carefully.':'100 questions: photo reading supports the supplied TGMSC sheet layout. Check the green circles and every answer before confirming.';
}
$('layout').addEventListener('change',updateFormHelp);
freshSetup();
