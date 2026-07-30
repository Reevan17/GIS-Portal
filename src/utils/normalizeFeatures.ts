/**
 * Normalize raw QGIS property names in a GeoJSON FeatureCollection
 * into canonical names used by the application.
 *
 * Extracted as a shared utility so it can be used by both
 * useGeoJSON hook and the prediction components.
 *
 * Canonical rainfall keys:  State, rainfall, rain_categ, rank, Year
 * Canonical GW keys:        State, District, Annual_Rep, Net_GW, Total_Curr, Stage_of_G, Year
 */

/**
 * Extract a 4-digit year from a file path, e.g. "rainfall_2024.geojson" → "2024"
 */
export function extractYear(filePath: string): string | null {
  const m = filePath.match(/(\d{4})/);
  return m ? m[1] : null;
}

export function normalizeFeatures(data: any, filePath: string): void {
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) return;

  const year = extractYear(filePath);

  data.features.forEach((f: any) => {
    if (!f.properties) f.properties = {};
    const p = f.properties;

    // ── Normalise state / district name ──────────────────────────────
    if (p.STATE && !p.State) p.State = p.STATE;
    if (p.DISTRICT && !p.District) p.District = p.DISTRICT;

    // ── Rainfall normaliser ─────────────────────────────────────────
    // Raw keys look like: collective_rainfall_pivoted_updated2_2024
    // Each file contains ALL years; pick the one matching the filename.
    if (p.rainfall === undefined) {
      const keys = Object.keys(p);
      const rainKeys = keys.filter(k => k.includes('collective_rainfall'));
      if (rainKeys.length > 0) {
        // Pick the key that matches the requested year, or fall back to first
        const targetKey = year
          ? rainKeys.find(k => k.endsWith(`_${year}`)) ?? rainKeys[0]
          : rainKeys[0];
        const val = parseFloat(p[targetKey]);
        p.rainfall = isNaN(val) ? 0 : val;
        p.Year = year ? Number(year) : undefined;

        // Derive category
        if (p.rainfall < 400) p.rain_categ = 'Very Low';
        else if (p.rainfall < 800) p.rain_categ = 'Low';
        else if (p.rainfall < 1200) p.rain_categ = 'Moderate';
        else if (p.rainfall < 2000) p.rain_categ = 'High';
        else p.rain_categ = 'Very High';
      }
    }

    // ── Groundwater normaliser ──────────────────────────────────────
    if (p.Annual_Rep === undefined) {
      const keys = Object.keys(p);
      const lowerKeys = keys.map(k => ({ orig: k, low: k.toLowerCase() }));

      // Recharge / Replenishable → Annual_Rep
      const repEntry = lowerKeys.find(
        e => e.low.includes('recharge') || e.low.includes('replenishable')
      );
      if (repEntry) p.Annual_Rep = parseFloat(p[repEntry.orig]) || 0;

      // Extractable / Net Availability → Net_GW
      const netEntry = lowerKeys.find(
        e => e.low.includes('extractable') || e.low.includes('net annual ground water availability') || e.low.includes('net ground water availability')
      );
      if (netEntry) p.Net_GW = parseFloat(p[netEntry.orig]) || 0;

      // Extraction Total / Draft → Total_Curr
      const draftEntry = lowerKeys.find(
        e => e.low.includes('extraction') ||
             e.low.includes('draft') ||
             e.low.endsWith('_total') ||
             e.low === 'total'
      );
      if (draftEntry) p.Total_Curr = parseFloat(p[draftEntry.orig]) || 0;

      // Stage of Ground Water
      const stageEntry = lowerKeys.find(e => e.low.includes('stage of ground'));
      if (stageEntry) {
        p.Stage_of_G = parseFloat(p[stageEntry.orig]) || 0;
      } else if (typeof p.Net_GW === 'number' && p.Net_GW > 0 && typeof p.Total_Curr === 'number') {
        p.Stage_of_G = (p.Total_Curr / p.Net_GW) * 100;
      }

      // Future availability
      const futureEntry = lowerKeys.find(
        e => e.low.includes('future')
      );
      if (futureEntry) p.GW_Availab = parseFloat(p[futureEntry.orig]) || 0;

      if (year) p.Year = Number(year);
    }
  });

  // ── Rank rainfall features by value (descending) ────────────────
  if (data.features.length > 0 && data.features[0]?.properties?.rainfall !== undefined) {
    const sorted = [...data.features].sort(
      (a: any, b: any) => (b.properties.rainfall || 0) - (a.properties.rainfall || 0)
    );
    sorted.forEach((sf: any, idx: number) => {
      sf.properties.rank = idx + 1;
    });
  }
}
