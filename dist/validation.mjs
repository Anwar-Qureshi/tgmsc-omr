export function parsePoints(raw){
 const parts=raw.trim().split('/');
 if(parts.length>2 || parts.some(p=>!/^\s*(?:\d+(?:\.\d+)?|\.\d+)\s*$/.test(p))) throw Error('Use a number or fraction for marks, such as 2 or 2/3.');
 const value=Number(parts[0])/(parts.length===2?Number(parts[1]):1);
 if(!Number.isFinite(value)||value<0||value>1000) throw Error('Enter a finite mark between 0 and 1000.');
 return value;
}

export function validExam(saved){
 return !!saved && typeof saved.key==='string' && [30,50,100,200].includes(saved.key.length) && (saved.key.length===200?/^[ABCDE]+$/:/^[ABCD]+$/).test(saved.key) && typeof saved.title==='string' && saved.title.trim().length>0 && saved.title.length<=100 && Number.isFinite(saved.plus) && saved.plus>0 && saved.plus<=1000 && Number.isFinite(saved.minus) && saved.minus>=0 && saved.minus<=1000;
}
