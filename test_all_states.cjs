const fs = require('fs');
const path = require('path');
const regression = require('regression');

const years = [2013, 2017, 2020, 2022, 2023, 2024, 2025];
const allData = {};

for (const yr of years) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', `groundwater_states_${yr}.geojson`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      data.features.forEach(f => {
         const p = f.properties;
         if (p.STATE && !p.State) p.State = p.STATE;
         
         const keys = Object.keys(p);
         const lowerKeys = keys.map(k => ({ orig: k, low: k.toLowerCase() }));
         
         const stageEntry = lowerKeys.find(e => e.low.includes('stage of ground'));
         if (stageEntry) {
           p.Stage_of_G = parseFloat(p[stageEntry.orig]) || 0;
         } else {
           const netEntry = lowerKeys.find(
             e => e.low.includes('extractable') || e.low.includes('net annual ground water availability') || e.low.includes('net ground water availability')
           );
           let net = netEntry ? parseFloat(p[netEntry.orig]) || 0 : 0;
           
           const draftEntry = lowerKeys.find(
             e => e.low.includes('extraction') || e.low.includes('draft') || e.low.endsWith('_total') || e.low === 'total'
           );
           let total = draftEntry ? parseFloat(p[draftEntry.orig]) || 0 : 0;
           
           if (net > 0 && total > 0) p.Stage_of_G = (total / net) * 100;
         }
      });
      allData[yr] = data;
    }
  } catch (e) {
    console.error(`Error loading ${yr}:`, e);
  }
}

const stateMap = new Map();
for (const yearKey of Object.keys(allData)) {
  const year = Number(yearKey);
  const fc = allData[year];
  if (!fc?.features) continue;

  for (const feature of fc.features) {
    const state = feature.properties?.State;
    const stage = feature.properties?.Stage_of_G;
    if (!state || stage === undefined || isNaN(stage)) continue;

    if (!stateMap.has(state)) stateMap.set(state, []);
    stateMap.get(state).push({ x: year, y: stage });
  }
}

let totalR2 = 0;
let validCount = 0;

for (const [state, points] of stateMap.entries()) {
  points.sort((a, b) => a.x - b.x);
  if (points.length < 3) continue;
  
  const YEAR_OFFSET = 2000;
  const data = points.map(p => [p.x - YEAR_OFFSET, p.y]);
  const result = regression.polynomial(data, { order: 2 });
  
  console.log(`${state}: R2 = ${result.r2} (Points: ${points.length})`);
  totalR2 += result.r2;
  validCount++;
}

console.log(`\nAverage R2: ${totalR2 / validCount}`);
