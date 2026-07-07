#!/usr/bin/env bash

# =============================================================================
# India Water Resources GIS — Data Preprocessing Script
# Converts raw NDJSON .geojsonl files from QGIS to simplified,
# web-ready .geojson FeatureCollection files for Leaflet.
#
# Requirements: Node.js / npx (mapshaper)
# Usage: bash scripts/preprocess_data.sh
# =============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_SRC="/Users/reevan/Desktop/Groundwater/Geojsons"
DATA_OUT="$PROJECT_ROOT/public/data"

RAINFALL_SRC="$DATA_SRC/Rainfall"
GW_STATE_SRC="$DATA_SRC/groundwater_state"
GW_DIST_SRC="$DATA_SRC/groundwater_district"
STATIONS_SRC="$DATA_SRC/groundwater_station.geojsonl"
STATES_SRC="$DATA_SRC/states_boundary.geojsonl"
RIVERS_SRC="$DATA_SRC/rivers.geojsonl"
WATERSHED_SRC="$DATA_SRC/watershed.geojsonl"

YEARS=(2013 2017 2020 2022 2023 2024 2025)
DISTRICT_STATES=(karnataka kerala tamilnadu)

mkdir -p "$DATA_OUT"

echo ""
echo "=================================================="
echo "  India Water GIS — Data Preprocessing"
echo "  Output: $DATA_OUT"
echo "=================================================="
echo ""

# Helper: simplify NDJSON .geojsonl with mapshaper
simplify_geojsonl() {
  local INPUT="$1"
  local OUTPUT="$2"
  local SIMPLIFY="${3:-5%}"

  echo "  ➜  $(basename "$INPUT")  →  $(basename "$OUTPUT")  [simplify=${SIMPLIFY}]"

  npx mapshaper -i "$INPUT" ndjson \
    -simplify "$SIMPLIFY" keep-shapes \
    -o "$OUTPUT" format=geojson force
}

# ── 1. India States Boundary ──────────────────────────────────────────────────
echo "▶ Processing India States Boundary..."
if [ ! -f "$DATA_OUT/india_states.geojson" ]; then
  simplify_geojsonl "$STATES_SRC" "$DATA_OUT/india_states.geojson" "5%"
fi
echo "  ✅ india_states.geojson done ($(du -sh "$DATA_OUT/india_states.geojson" | awk '{print $1}'))"
echo ""

# ── 2. Rainfall (per year) ───────────────────────────────────────────────────
echo "▶ Processing Rainfall layers..."
for YEAR in "${YEARS[@]}"; do
  SRC="$RAINFALL_SRC/rainfall_${YEAR}.geojsonl"
  OUT="$DATA_OUT/rainfall_${YEAR}.geojson"
  if [ -f "$SRC" ]; then
    if [ ! -f "$OUT" ]; then
      simplify_geojsonl "$SRC" "$OUT" "5%"
    fi
    echo "  ✅ rainfall_${YEAR}.geojson done ($(du -sh "$OUT" | awk '{print $1}'))"
  else
    echo "  ⚠️  Source not found: $SRC"
  fi
done
echo ""

# ── 3. Groundwater State Level (per year) ────────────────────────────────────
echo "▶ Processing Groundwater State layers..."
for YEAR in "${YEARS[@]}"; do
  SRC="$GW_STATE_SRC/india_${YEAR}.geojsonl"
  OUT="$DATA_OUT/groundwater_states_${YEAR}.geojson"
  if [ -f "$SRC" ]; then
    if [ ! -f "$OUT" ]; then
      simplify_geojsonl "$SRC" "$OUT" "5%"
    fi
    echo "  ✅ groundwater_states_${YEAR}.geojson done ($(du -sh "$OUT" | awk '{print $1}'))"
  else
    echo "  ⚠️  Source not found: $SRC"
  fi
done
echo ""

# ── 4. Groundwater District Level (state × year) ─────────────────────────────
echo "▶ Processing Groundwater District layers..."
for STATE in "${DISTRICT_STATES[@]}"; do
  for YEAR in "${YEARS[@]}"; do
    SRC="$GW_DIST_SRC/${STATE}_${YEAR}.geojsonl"
    OUT="$DATA_OUT/${STATE}_groundwater_${YEAR}.geojson"
    if [ -f "$SRC" ]; then
      if [ ! -f "$OUT" ]; then
        # District files are very large (~187MB each), use 2% simplification
        simplify_geojsonl "$SRC" "$OUT" "2%"
      fi
      echo "  ✅ ${STATE}_groundwater_${YEAR}.geojson done ($(du -sh "$OUT" | awk '{print $1}'))"
    else
      echo "  ⚠️  Source not found: $SRC"
    fi
  done
done
echo ""

# ── 5. Groundwater Quality Stations (points — no simplify needed) ─────────────
echo "▶ Processing Groundwater Stations..."
OUT="$DATA_OUT/groundwater_quality_stations.geojson"
if [ ! -f "$OUT" ]; then
  echo "  ➜  groundwater_station.geojsonl  →  groundwater_quality_stations.geojson  [points]"
  npx mapshaper -i "$STATIONS_SRC" ndjson \
    -o "$OUT" format=geojson force
fi
echo "  ✅ groundwater_quality_stations.geojson done ($(du -sh "$OUT" | awk '{print $1}'))"
echo ""

# ── 6. River Basins ──────────────────────────────────────────────────────────
echo "▶ Processing River Basins..."
OUT="$DATA_OUT/river_basins.geojson"
if [ ! -f "$OUT" ]; then
  simplify_geojsonl "$RIVERS_SRC" "$OUT" "10%"
fi
echo "  ✅ river_basins.geojson done ($(du -sh "$OUT" | awk '{print $1}'))"
echo ""

# ── 7. Watersheds ────────────────────────────────────────────────────────────
echo "▶ Processing Watersheds (large file — ~349MB, please wait)..."
OUT="$DATA_OUT/watersheds.geojson"
if [ ! -f "$OUT" ]; then
  simplify_geojsonl "$WATERSHED_SRC" "$OUT" "2%"
fi
echo "  ✅ watersheds.geojson done ($(du -sh "$OUT" | awk '{print $1}'))"
echo ""

# ── Done ─────────────────────────────────────────────────────────────────────
echo "=================================================="
echo "  ✅ ALL DATA LAYERS PROCESSED!"
echo "  Output directory: $DATA_OUT"
echo "  File count: $(ls "$DATA_OUT" | wc -l | tr -d ' ')"
echo "  Total size: $(du -sh "$DATA_OUT" | awk '{print $1}')"
echo "=================================================="
