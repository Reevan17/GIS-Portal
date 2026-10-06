# India Water Resources GIS Intelligence Platform

An interactive GIS and Hydrogeological Intelligence platform visualizing and analyzing India's groundwater, rainfall, river basins, watersheds, and water quality stations across multiple survey years (2013–2025).

---

## Key Features

- **Interactive GIS Map Viewer:** Multi-layer choropleths for State & District boundaries, CGWB Groundwater extraction, IMD Rainfall distribution, River Basins, Watersheds, and Monitoring Stations.
- **Coupled Hydrogeological Prediction Model (ARDL):**
  - Multivariate prediction of future **Groundwater Extraction Stage (%)** driven by historical aquifer memory ($\text{Stage}_{t-1}$) and corresponding annual rainfall recharge ($\text{Rainfall}_t$).
  - **Dynamic Monsoon Scenarios:** Simulate 2026 groundwater response under **Normal (100%)**, **Deficit / Drought (-20%)**, and **Surplus (+20%)** monsoon conditions.
  - High model fidelity with state-specific regression calibration ($R^2$ up to $0.99$).
- **Multi-Year Analytics & Comparison:** Cross-state benchmarks, historical trend analysis, and stress level categorization based on official Central Ground Water Board (CGWB) standards.

---

## Prerequisites

Before running the project, ensure you have:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes bundled with Node.js)

---

## Getting Started for Collaborators

### 1. Clone the repository
```bash
git clone https://github.com/Reevan17/GIS-Portal.git
cd GIS-Portal
```

### 2. Install dependencies
> **Note:** In Node.js/React projects, `package.json` and `package-lock.json` serve the same role as Python's `requirements.txt`. Running `npm install` automatically installs the exact versions of all required libraries:
```bash
npm install
```

### 3. Start the local development server
```bash
npm run dev
```
Open your browser at **`http://localhost:5173`** to access the dashboard.

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```

---

## Tech Stack & Dependencies

- **Frontend Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Mapping & Spatial Analytics:** Leaflet, React-Leaflet, Leaflet MarkerCluster, Turf.js
- **Data Visualization:** Chart.js, React-ChartJS-2
- **Animation & UI:** Framer Motion, React Icons
- **Data Parsing:** PapaParse (CSV), GeoJSON

---

## Data Sources
- **Groundwater:** Central Ground Water Board (CGWB), Ministry of Jal Shakti, Government of India (2013, 2017, 2020, 2022, 2023, 2024, 2025).
- **Rainfall:** India Meteorological Department (IMD), Ministry of Earth Sciences.
