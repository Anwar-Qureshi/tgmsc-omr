export function parsePoints(raw){
 const parts=raw.trim().split('/');
 if(parts.length>2 || parts.some(p=>!/^\s*(?:\d+(?:\.\d+)?|\.\d+)\s*$/.test(p))) throw Error('Use a number or fraction for marks, such as 2 or 2/3.');
 const value=Number(parts[0])/(parts.length===2?Number(parts[1]):1);
 if(!Number.isFinite(value)||value<0||value>1000) throw Error('Enter a number from 0 to 1000. Fractions must have a nonzero number below the line.');
 return value;
}

