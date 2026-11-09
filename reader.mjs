import {grid} from './template-100.mjs';
import {template50} from './template-50.mjs';
import {template200} from './template-200.mjs';
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
const cardinal=[[1,0],[-1,0],[0,1],[0,-1]];

function bubbleRingScore(graySafe,map,x,y,iso=true){
 if(!iso){
  const c0=graySafe(map([x,y]));
  if(c0<0) return -50;
  const c1=graySafe(map([x+2.5,y])), c2=graySafe(map([x-2.5,y])), c3=graySafe(map([x,y+2.5])), c4=graySafe(map([x,y-2.5]));
  if(c1<0||c2<0||c3<0||c4<0) return -50;
  const cMin=Math.min(c0,c1,c2,c3,c4);
  let sum=0;
  for(const [ux,uy] of cardinal){
   const r6=graySafe(map([x+6*ux,y+6*uy])), r7=graySafe(map([x+7*ux,y+7*uy])), r8=graySafe(map([x+8*ux,y+8*uy])), r9=graySafe(map([x+9*ux,y+9*uy])), r12=graySafe(map([x+12*ux,y+12*uy]));
   if(r6<0||r7<0||r8<0||r9<0||r12<0) return -50;
   const ringMin=Math.min(r7,r8,r6+1.5,r9+1.5);
   const hollow=Math.min(cMin-ringMin,r12-ringMin);
   sum+=Math.max(0,hollow);
  }
  return Math.min(sum*0.25,65);
 }
 const [mx,my]=map([x,y]);
 const ix=Math.round(mx), iy=Math.round(my);
 const c0=graySafe([ix,iy]);
 if(c0<0) return -50;
 const [mx1,my1]=map([x+1,y]);
 const step=Math.hypot(mx1-mx,my1-my);
 const c1=graySafe([mx+2.5*step,iy]), c2=graySafe([mx-2.5*step,iy]), c3=graySafe([ix,my+2.5*step]), c4=graySafe([ix,my-2.5*step]);
 if(c1<0||c2<0||c3<0||c4<0) return -50;
 const cMin=Math.min(c0,c1,c2,c3,c4);
 let sum=0;
 for(const [ux,uy] of cardinal){
  const r6=graySafe([mx+6*step*ux,my+6*step*uy]), r7=graySafe([mx+7*step*ux,my+7*step*uy]), r8=graySafe([mx+8*step*ux,my+8*step*uy]), r9=graySafe([mx+9*step*ux,my+9*step*uy]), r12=graySafe([mx+12*step*ux,my+12*step*uy]);
  if(r6<0||r7<0||r8<0||r9<0||r12<0) return -50;
  const ringMin=Math.min(r6,r7,r8,r9);
  const hollow=Math.min(cMin-ringMin,r12-ringMin);
  const edge=r12-ringMin;
  sum+=Math.max(0,hollow)+0.35*Math.max(0,edge);
 }
 return Math.min(sum*0.25,65);
}

function snapGrid200(graySafe,map,baseGrid){
 const snapped=Array(200);
 const centers=[4.5,14.5,24.5,34.5,44.5];
 for(let c=0;c<4;c++){
  const blockShifts=[];
  for(let b=0;b<5;b++){
   const rStart=b*10;
   let bxBest=0,byBest=0,bSc=-1e9;
   for(const dyC of [0,-2,2,-4,4]){
    for(const dxC of [0,-2,2,-4,4,-6,6]){
     let sc=-0.05*(dxC*dxC+dyC*dyC);
     for(let r=rStart;r<rStart+10;r++){
      const row=baseGrid[c*50+r];
      for(let o=0;o<5;o++) sc+=bubbleRingScore(graySafe,map,row[o][0]+dxC,row[o][1]+dyC,false);
     }
     if(sc>bSc){bSc=sc;bxBest=dxC;byBest=dyC;}
    }
   }
   for(const dyF of [0,-1,1]){
    for(const dxF of [0,-1,1]){
     const candX=bxBest+dxF, candY=byBest+dyF;
     let sc=-0.05*(candX*candX+candY*candY);
     for(let r=rStart;r<rStart+10;r++){
      const row=baseGrid[c*50+r];
      for(let o=0;o<5;o++) sc+=bubbleRingScore(graySafe,map,row[o][0]+candX,row[o][1]+candY,false);
     }
     if(sc>bSc){bSc=sc;bxBest=candX;byBest=candY;}
    }
   }
   blockShifts.push([bxBest,byBest]);
  }
  for(let r=0;r<50;r++){
   let idx=0;
   while(idx<3&&r>centers[idx+1]) idx++;
   const t=Math.max(0,Math.min(1,(r-centers[idx])/(centers[idx+1]-centers[idx])));
   const dxInterp=blockShifts[idx][0]+t*(blockShifts[idx+1][0]-blockShifts[idx][0]);
   const dyInterp=blockShifts[idx][1]+t*(blockShifts[idx+1][1]-blockShifts[idx][1]);
   const q=c*50+r, row=baseGrid[q];
   let rxBest=dxInterp,ryBest=dyInterp,rSc=-1e9;
   for(const dyR of [0,-0.75,0.75,-1.5,1.5]){
    for(const dxR of [0,-0.75,0.75,-1.5,1.5]){
     let sc=-0.05*(dxR*dxR+dyR*dyR);
     for(let o=0;o<5;o++) sc+=bubbleRingScore(graySafe,map,row[o][0]+dxInterp+dxR,row[o][1]+dyInterp+dyR,false);
     if(sc>rSc){rSc=sc;rxBest=dxInterp+dxR;ryBest=dyInterp+dyR;}
    }
   }
   snapped[q]=row.map(([x,y])=>[x+rxBest,y+ryBest]);
  }
 }
 return snapped;
}

const templates={100:{anchors,grid},50:template50,200:template200};
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
 const graySafe=([x,y])=>{
  x=Math.round(x);y=Math.round(y);
  if(!Number.isFinite(x+y)||x<0||y<0||x>=width||y>=height) return -1;
  const p=(y*width+x)*4;
  return .299*data[p]+.587*data[p+1]+.114*data[p+2];
 };
 const activeGrid=questions===200?snapGrid200(graySafe,map,template.grid):template.grid;
 const rows=activeGrid.map(bubbles=>{
  const outline=bubbles.map(([x,y])=>{
   const edges=directions.map(([u,v])=>{
    const at=r=>gray(map([x+r*u,y+r*v]));
    return Math.max(0,at(questions===50?13:11)-Math.min(at(6),at(7),at(8),at(9),...(questions===50?[at(10),at(11)]:[])));
   }).sort((a,b)=>a-b);
   return edges[questions===200?4:3];
  });
  const strengths=bubbles.map(([x,y])=>{
   const bg=[[-9,-9],[9,-9],[-9,9],[9,9]].map(([i,j])=>gray(map([x+i,y+j]))).sort((a,b)=>a-b)[2];
   const center=[[0,0],[3,0],[-3,0],[0,3],[0,-3]].map(([i,j])=>gray(map([x+i,y+j])));
   return center.reduce((s,p)=>s+Math.max(0,bg-p),0)/center.length;
  });
  const order=bubbles.map((_,i)=>i).sort((a,b)=>strengths[b]-strengths[a]);
  const [first,second]=order.map(i=>strengths[i]);
  const visible=outline.filter(value=>value>=5).length;
  const optionLetters='ABCDE'.slice(0,bubbles.length);
  const minOutlines=questions===200?3:bubbles.length;
  const answer=visible<minOutlines?'?':first<26?'-':first>=63&&second<32&&first-second>=38?optionLetters[order[0]]:'?';
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
 if(typeof key!=='string'||!key.length||!/^[ABCDE]+$/.test(key)||!Array.isArray(answers)||!Number.isFinite(correctPoints)||correctPoints<=0||!Number.isFinite(penalty)||penalty<0) return null;
 if(key.length!==answers.length || answers.some(a=>!['A','B','C','D','E','-','X'].includes(a))) return null;
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
 const graySafe=([x,y])=>{
  x=Math.round(x);y=Math.round(y);
  if(!Number.isFinite(x+y)||x<0||y<0||x>=width||y>=height) return -1;
  const p=(y*width+x)*4;
  return .299*data[p]+.587*data[p+1]+.114*data[p+2];
 };
 const pixels=new Uint8Array(width*height);
 for(let i=0,j=0;i<pixels.length;i++,j+=4){
  pixels[i]=(.299*data[j]+.587*data[j+1]+.114*data[j+2])<94?1:0;
 }
 const minSide=Math.max(questions===200?5:3,Math.round(Math.min(width,height)*(questions===200?.0055:.003)));
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
   const cx=sx/end, cy=sy/end;
   if(questions===200){
    const rad=Math.max(6,Math.round(Math.max(w,h)*.9));
    const bgs=[[-rad,-rad],[rad,-rad],[-rad,rad],[rad,rad]].map(([dx,dy])=>graySafe([cx+dx,cy+dy])).sort((a,b)=>a-b);
    if(bgs[1]<130) continue;
   }
   candidates.push({point:[cx,cy],size:Math.sqrt(w*h),density,ratio});
  }
 }
 if(questions===200){
  const bls=candidates.filter(c=>c.point[0]<width*.35&&c.point[1]>height*.70);
  const brs=candidates.filter(c=>c.point[0]>width*.65&&c.point[1]>height*.70);
  const pairs=[];
  for(const bl of bls)for(const br of brs){
   const dx=br.point[0]-bl.point[0], dy=br.point[1]-bl.point[1], dist=Math.hypot(dx,dy);
   if(dist<width*.70||Math.abs(dy/dx)>.35) continue;
   const sizeRatio=Math.min(bl.size,br.size)/Math.max(bl.size,br.size);
   if(sizeRatio<.35) continue;
   const score=dist/width+((bl.point[1]+br.point[1])/(2*height))*.6+sizeRatio*.2;
   pairs.push({bl:bl.point,br:br.point,dist,score});
  }
  pairs.sort((a,b)=>b.score-a.score);
  const evalGlobal=(pts,rowsSubset,iso=true)=>{
   if(!validAnchorGeometry(pts,width,height)) return -1e9;
   let map;
   try{map=projection(template.anchors,pts);}catch{return -1e9;}
   let sum=0, minColOpt=1e9;
   for(let c=0;c<4;c++){
    const colScores=[0,0,0,0,0];
    for(const r of rowsSubset){
     const row=template.grid[c*50+r];
     for(let o=0;o<5;o++){
      const sc=bubbleRingScore(graySafe,map,row[o][0],row[o][1],iso);
      if(sc<0) return -1e9;
      colScores[o]+=sc;
     }
    }
    for(let o=0;o<5;o++){
     sum+=colScores[o];
     if(colScores[o]<minColOpt) minColOpt=colScores[o];
    }
   }
   let borderScore=0;
   for(const xSample of [125,330,360,590,620,850,880,1065]){
    const above=graySafe(map([xSample,296])), below=graySafe(map([xSample,326]));
    if(above>=0&&below>=0){
     const lineMin=Math.min(graySafe(map([xSample,306])),graySafe(map([xSample,309])),graySafe(map([xSample,312])),graySafe(map([xSample,315])));
     const contrast=Math.min(above,below)-lineMin;
     if(contrast>0) borderScore+=Math.min(contrast,80)*1.6;
    }
   }
   return sum+5*minColOpt+borderScore;
  };
  const rowsFast=[0,2,15,32,49];
  const rowsMed=[0,1,5,11,17,23,29,35,42,49];
  let bestOverall=null;
  const searchWith=(hList,iso)=>{
   for(const {bl,br,dist:L} of pairs.slice(0,2)){
    const dx=br[0]-bl[0], dy=br[1]-bl[1], ux=dx/L, uy=dy/L, nx=uy, ny=-ux;
    const cx_b=(bl[0]+br[0])/2, cy_b=(bl[1]+br[1])/2;
    const makePts=(hRatio,topScale,shiftU,tilt)=>{
     const cx_t=cx_b+hRatio*L*nx+shiftU*L*ux;
     const cy_t=cy_b+hRatio*L*ny+shiftU*L*uy;
     const hw=0.5*topScale*L;
     const t_ux=ux-tilt*nx, t_uy=uy-tilt*ny;
     return [[cx_t-hw*t_ux,cy_t-hw*t_uy],[cx_t+hw*t_ux,cy_t+hw*t_uy],br,bl];
    };
    let bh=hList[0],bs=0.90,bu=0.015,bt=0,bestFast=-1e9;
    for(const hRatio of hList){
     for(const topScale of [0.84,0.86,0.88,0.90,0.92,0.94,0.96,0.98,1.00]){
      for(const shiftU of [-0.015,-0.005,0.005,0.015,0.025,0.035]){
       const sc=evalGlobal(makePts(hRatio,topScale,shiftU,0),rowsFast,iso);
       if(sc>bestFast){bestFast=sc;bh=hRatio;bs=topScale;bu=shiftU;}
      }
     }
    }
    if(bestFast<=-1e8) continue;
    let bestSc=evalGlobal(makePts(bh,bs,bu,bt),rowsMed,iso);
    for(const stepScale of [1,0.35]){
     for(let pass=0;pass<2;pass++){
      for(let i=-4;i<=4;i++){
       const cand=bh+i*0.00625*stepScale;
       const sc=evalGlobal(makePts(cand,bs,bu,bt),rowsMed,iso);
       if(sc>bestSc){bestSc=sc;bh=cand;}
      }
      for(let i=-3;i<=3;i++){
       const cand=bs+i*0.0066667*stepScale;
       const sc=evalGlobal(makePts(bh,cand,bu,bt),rowsMed,iso);
       if(sc>bestSc){bestSc=sc;bs=cand;}
      }
      for(let i=-3;i<=3;i++){
       const cand=bu+i*0.004*stepScale;
       const sc=evalGlobal(makePts(bh,bs,cand,bt),rowsMed,iso);
       if(sc>bestSc){bestSc=sc;bu=cand;}
      }
      for(let i=-3;i<=3;i++){
       const cand=bt+i*0.0083333*stepScale;
       const sc=evalGlobal(makePts(bh,bs,bu,cand),rowsMed,iso);
       if(sc>bestSc){bestSc=sc;bt=cand;}
      }
     }
    }
    const points=makePts(bh,bs,bu,bt);
    try{
     readSheet({data,width,height},points,200);
     if(!bestOverall||bestSc>bestOverall.quality) bestOverall={points,quality:bestSc};
    }catch{}
   }
  };
  searchWith([1.06,1.07,1.08,1.09,1.10,1.11,1.12,1.13,1.14,1.15],true);
  if(!bestOverall) searchWith([1.18,1.20,1.22],false);
  return bestOverall?bestOverall.points:null;
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