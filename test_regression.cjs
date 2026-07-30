const regression = require('regression');

// Simulated groundwater extraction data
const points = [
  { x: 2013, y: 70 },
  { x: 2017, y: 72 },
  { x: 2020, y: 74 },
  { x: 2022, y: 75 },
  { x: 2023, y: 77 },
  { x: 2024, y: 80 },
  { x: 2025, y: 81 }
];

const OFFSET = 2000;
const data = points.map(p => [p.x - OFFSET, p.y]);

const result = regression.polynomial(data, { order: 2 });
console.log("R2:", result.r2);
console.log("Equation:", result.equation);
console.log("String:", result.string);

const dataUnshifted = points.map(p => [p.x, p.y]);
const resultUnshifted = regression.polynomial(dataUnshifted, { order: 2 });
console.log("Unshifted R2:", resultUnshifted.r2);

const resultLinear = regression.linear(data);
console.log("Linear R2:", resultLinear.r2);
