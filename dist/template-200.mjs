// 200-question TGMSC Police Constable & SI Grand Test layout
// 4 columns of 50 questions (5 blocks of 10 questions per column, 5 options A, B, C, D, E)
export const anchors = [[100, 310], [1080, 310], [1080, 1400], [100, 1400]];

const colsCorners = [
  [196.9, 296.1, 205.9, 301.6],
  [423.7, 519.8, 430.6, 527.8],
  [693.0, 790.7, 700.9, 798.0],
  [938.7, 1036.4, 931.7, 1028.8]
];

const blockYs = [
  [364.7, 547.4],
  [567.9, 748.0],
  [771.9, 950.1],
  [973.7, 1149.3],
  [1172.6, 1378.6]
];

const blocks = colsCorners.map(([tlX, trX, blX, brX]) =>
  blockYs.map(([yTop, yBot]) => {
    const t = (yTop - 364.7) / (1378.6 - 364.7);
    const b = (yBot - 364.7) / (1378.6 - 364.7);
    const xTl = tlX + t * (blX - tlX);
    const xTr = trX + t * (brX - trX);
    const xBl = tlX + b * (blX - tlX);
    const xBr = trX + b * (brX - trX);
    return [xTl, yTop, xTr, yTop, xBl, yBot, xBr, yBot];
  })
);

export const grid = blocks.flatMap(col => col.flatMap(block =>
  Array.from({length: 10}, (_, row) => Array.from({length: 5}, (_, opt) => {
    const u = opt / 4, v = row / 9;
    return [0, 1].map(i => Math.round(((1 - v) * ((1 - u) * block[i] + u * block[i + 2]) + v * ((1 - u) * block[i + 4] + u * block[i + 6])) * 10) / 10);
  }))
));

export const template200 = {anchors, grid};
