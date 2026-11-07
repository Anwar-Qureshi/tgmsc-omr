import {grid} from './template-100.mjs';
import {template50} from './template-50.mjs';
export {grid};
export const anchors = [[154,167],[978,150],[1072,1288],[145,1341]];
export function projection(from,to){
 const a=from.flatMap(([x,y],i)=>{
  const [u,v]=to[i];
  return [[x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]];
 });
 for(let i=0;i<8;i++){
  let j=i;
  for(let k=i+1;k<8;k++) if(Math.abs(a[k][i])>Math.abs(a[j][i])) j=k;
  [a[i],a[j]]=[a[j],a[i]];
  const pivot=a[i][i];
  if(Math.abs(pivot)<1e-9) throw Error('The four points must outline the sheet.');
  a[i]=a[i].map(n=>n/pivot);
  for(let k=0;k<8;k++) if(k!==i){const m=a[k][i]; a[k]=a[k].map((n,c)=>n-m*a[i][c]);}
 }
 const [a0,b,c,d,e,f,g,h]=a.map(row=>row[8]);
 return ([x,y])=>[(a0*x+b*y+c)/(g*x+h*y+1),(d*x+e*y+f)/(g*x+h*y+1)];
}
const directions=Array.from({length:8},(_,i)=>[Math.cos(i*Math.PI/4),Math.sin(i*Math.PI/4)]);

const templates={100:{anchors,grid},50:template50};
export function readSheet(frame,points,questions=100){
 const template=templates[questions];
 if(!template) throw Error('This form requires manual entry.');
 const {data,width,height}=frame;
 if(!validAnchorGeometry(points,width,height)) throw Error('Use the four small printed squares around the form, clockwise from the top left.');
 const map=projection(template.anchors,points);
 const gray=([x,y])=>{
  x=Math.round(x);y=Math.round(y);
  if(!Number.isFinite(x+y)||x<0||y<0||x>=width||y>=height) throw Error('The answer grid extends outside the photo. Retake it.');
  const p=(y*width+x)*4;
  return .299*data[p]+.587*data[p+1]+.114*data[p+2];
 };
 const rows=template.grid.map(bubbles=>{
  const outline=bubbles.map(([x,y])=>{
   const edges=directions.map(([u,v])=>{
    const at=r=>gray(map([x+r*u,y+r*v]));
    return Math.max(0,at(questions===50?13:11)-Math.min(at(6),at(7),at(8),at(9),...(questions===50?[at(10),at(11)]:[])));
   }).sort((a,b)=>a-b);
   return edges[3];
  });
  const strengths=bubbles.map(([x,y])=>{
   const bg=[[-9,-9],[9,-9],[-9,9],[9,9]].map(([i,j])=>gray(map([x+i,y+j]))).sort((a,b)=>a-b)[2];
   const center=[[0,0],[3,0],[-3,0],[0,3],[0,-3]].map(([i,j])=>gray(map([x+i,y+j])));
   return center.reduce((s,p)=>s+Math.max(0,bg-p),0)/center.length;
  });
  const order=[0,1,2,3].sort((a,b)=>strengths[b]-strengths[a]);
  const [first,second]=order.map(i=>strengths[i]);
  const visible=outline.filter(value=>value>=5).length;
  const answer=visible<4?'?':first<26?'-':first>=63&&second<32&&first-second>=38?'ABCD'[order[0]]:'?';
  return {answer,points:bubbles.map(map),visible};
 });
 // Four squares can appear on another page. Require printed rows throughout
 // the answer region, and reject patches where consecutive rows disappear.
 const visibleRows=rows.filter(row=>row.visible>=3).length;
 if(visibleRows<Math.ceil(questions*.72)) throw Error('The answer grid does not match this form or is too faint. Retake the full '+questions+'-question sheet in even light.');
 for(let start=0;start<rows.length;start+=5){
  if(rows.slice(start,start+5).filter(row=>row.visible===0).length>=3){
   throw Error('Questions '+(start+1)+'–'+(start+5)+' are not readable. Retake the photo without glare, shadows or folds.');
  }
 }
 return rows.map(({answer,points})=>({answer,points}));
}
export function score(key,answers,correctPoints,penalty){
 if(typeof key!=='string'||!key.length||!/^[ABCD]+$/.test(key)||!Array.isArray(answers)||!Number.isFinite(correctPoints)||correctPoints<=0||!Number.isFinite(penalty)||penalty<0) return null;
 if(key.length!==answers.length || answers.some(a=>!['A','B','C','D','-','X'].includes(a))) return null;
 const correct=answers.filter((a,i)=>a===key[i]).length;
 const unanswered=answers.filter(a=>a==='-').length;
 const attempted=answers.length-unanswered;
 const wrong=attempted-correct;
 return {attempted,correct,wrong,unanswered,negative:wrong*penalty,total:correct*correctPoints-wrong*penalty};
}

// Look for compact dark components near the four printed registration marks.
export function findAnchors({data,width,height},questions=100){
 const template=templates[questions];
 if(!template) return null;
 const pixels=new Uint8Array(width*height);
 for(let i=0,j=0;i<pixels.length;i++,j+=4){
  pixels[i]=(.299*data[j]+.587*data[j+1]+.114*data[j+2])<94?1:0;
 }
 const minSide=Math.max(3,Math.round(Math.min(width,height)*.003));
 const maxSide=Math.max(10,Math.round(Math.min(width,height)*.018));
 const candidates=[];
 const queue=new Int32Array(pixels.length);
 for(let i=0;i<pixels.length;i++){
  if(!pixels[i]) continue;
  let end=1,x0=width,x1=0,y0=height,y1=0,sx=0,sy=0;
  pixels[i]=0;queue[0]=i;
  for(let head=0;head<end;head++){
   const p=queue[head], x=p%width, y=Math.floor(p/width);
   x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);sx+=x;sy+=y;
   const left=p-1,right=p+1,up=p-width,down=p+width;
   if(x&&pixels[left]){pixels[left]=0;queue[end++]=left;}
   if(x+1<width&&pixels[right]){pixels[right]=0;queue[end++]=right;}
   if(pixels[up]){pixels[up]=0;queue[end++]=up;}
   if(pixels[down]){pixels[down]=0;queue[end++]=down;}
  }
  const w=x1-x0+1,h=y1-y0+1,density=end/(w*h);
  const ratio=Math.min(w,h)/Math.max(w,h);
  if(Math.min(w,h)>=(questions===50?2:minSide)&&Math.max(w,h)<=maxSide&&ratio>=(questions===50?.14:.60)&&density>=(questions===50?.60:.67)){
   candidates.push({point:[sx/end,sy/end],size:Math.sqrt(w*h),density,ratio});
  }
 }
 const picks=template.anchors.map(([x,y],i)=>{
  const left=i===0||i===3, top=i<2;
  return candidates.filter(({point:[u,v],ratio})=>
   (left?u<width*.36:u>width*.64)&&(top?v<height*.30:v>height*(questions===50?.75:.66))&&(questions!==50||(top?ratio>=.55:ratio<=.70))
  ).map(c=>{
   const [u,v]=c.point;
   const distance=Math.hypot(u/width-x/1200,v/height-y/1600);
   return {...c,rank:distance+(1-c.density)*.12};
  }).sort((a,b)=>a.rank-b.rank).slice(0,5);
 });
 if(picks.some(p=>!p.length)) return null;
 const ranked=[];
 for(const a of picks[0])for(const b of picks[1])for(const c of picks[2])for(const d of picks[3]){
  const group=[a,b,c,d],points=group.map(p=>p.point);
  const sizes=group.map(p=>p.size);
  if(Math.max(...sizes)>(questions===50?3.5:2.15)*Math.min(...sizes)) continue;
  if(!validAnchorGeometry(points,width,height)) continue;
  const rank=group.reduce((sum,p)=>sum+p.rank,0);
  ranked.push({points,rank});
 }
 ranked.sort((a,b)=>a.rank-b.rank);
 const best=ranked[0];
 if(!best) return null;
 if(!ranked[1]||ranked[1].rank-best.rank>.018) return best.points;
 const close=ranked.filter(candidate=>candidate.rank-best.rank<=.018);
 if(close.length>6) return null;
 const plausible=close.filter(({points})=>{
  try{readSheet({data,width,height},points,questions);return true;}catch{return false;}
 });
 return plausible.length===1?plausible[0].points:null;
}

function validAnchorGeometry(points,width,height){
 if(points.length!==4) return false;
 const [a,b,c,d]=points;
 if(Math.min(b[0]-a[0],c[0]-d[0])<width*.43||
    Math.min(d[1]-a[1],c[1]-b[1])<height*.48) return false;
 return points.every(([x,y],i)=>{
  const [u,v]=points[(i+1)%4], [s,t]=points[(i+2)%4];
  return (u-x)*(t-v)-(v-y)*(s-u)>width*height*.12;
 });
}
