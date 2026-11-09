// Measured from the photographed 50-question TGMSC form. Each block
// records the centres of its four corner bubbles, in reading order.
const blocks=[
 [[210,654,284,651,213,849,290,844],[216,951,293,946,220,1165,300,1158]],
 [[384,647,456,645,392,838,466,832],[398,938,473,932,406,1148,485,1141]],
 [[551,641,621,638,565,828,635,823],[572,925,643,919,587,1130,661,1123]],
 [[712,634,781,632,729,820,797,813],[738,914,808,908,759,1115,832,1109]],
 [[870,627,935,624,890,809,957,804],[903,902,970,897,928,1100,998,1093]]
];
const grid=blocks.flatMap(column=>column.flatMap(block=>
 Array.from({length:5},(_,row)=>Array.from({length:4},(_,option)=>{
  const u=option/3,v=row/4;
  return [0,1].map(i=>(1-v)*((1-u)*block[i]+u*block[i+2])+v*((1-u)*block[i+4]+u*block[i+6]));
 }))
));
export const template50={anchors:[[108,194],[939,195],[1099,1342],[104,1474]],grid};
