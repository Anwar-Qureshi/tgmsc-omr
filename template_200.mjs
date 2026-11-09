// 200-question TGMSC Police Constable & SI Grand Test layout
// 4 columns of 50 questions (50 continuous rows per column, 5 options A, B, C, D, E)
export const anchors = [[100, 310], [1080, 310], [1080, 1400], [100, 1400]];

const cols = [
  [175.2, 278.0],
  [434.8, 538.8],
  [693.5, 796.9],
  [953.6, 1056.4]
];

const yStart = 365.0, yEnd = 1381.2;

export const grid = cols.flatMap(([xStart, xEnd]) =>
  Array.from({length: 50}, (_, row) => {
    const y = Math.round((yStart + (row / 49) * (yEnd - yStart)) * 10) / 10;
    return Array.from({length: 5}, (_, opt) => [
      Math.round((xStart + (opt / 4) * (xEnd - xStart)) * 10) / 10,
      y
    ]);
  })
);

export const template200 = {anchors, grid};