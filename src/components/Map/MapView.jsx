import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useApp } from '../../context/AppContext';
import { COLORS, DIVISION_COLORS, ROUTE_COLORS } from '../../utils/constants';
import { generateTownClusteredDots, generateMigrationFrames, filterTownsInPolygon } from '../../utils/populationDots';
import towns from '../../data/towns.json';
import settlerTowns from '../../data/settlerTowns.json';
import modernCherokee from '../../data/modernCherokee.json';
import forts from '../../data/forts.json';
import waypoints from '../../data/waypoints.json';
import populationData from '../../data/populationByStage.json';
import { SCENES } from '../../data/scenes';
import presentCherokeeNation from '../../geodata/present-cherokee-nation.json';
import presentQuallaBoundary from '../../geodata/present-qualla-boundary.json';
import historicalTrails from '../../geodata/historical-trails.json';
import cherokeeRivers from '../../geodata/cherokee-rivers.json';
import colonialClaims from '../../geodata/colonial-claims.json';
import battleSites from '../../geodata/battle-sites.json';
import './MapView.css';

// Import all territory GeoJSON files
import territoryPrecontact from '../../geodata/cherokee-territory-precontact.json';
import territory1777 from '../../geodata/cherokee-territory-1777.json';
import territory1785 from '../../geodata/cherokee-territory-1785.json';
import territory1791 from '../../geodata/cherokee-territory-1791.json';
import territory1798 from '../../geodata/cherokee-territory-1798.json';
import territory1806 from '../../geodata/cherokee-territory-1806.json';
import territory1814 from '../../geodata/cherokee-territory-1814.json';
import territory1819 from '../../geodata/cherokee-territory-1819.json';
import territory1835 from '../../geodata/cherokee-territory-1835.json';

const TERRITORY_MAP = {
  precontact: territoryPrecontact,
  '1777': territory1777,
  '1785': territory1785,
  '1791': territory1791,
  '1798': territory1798,
  '1806': territory1806,
  '1814': territory1814,
  '1819': territory1819,
  '1835': territory1835,
};

// The Five Lower Towns of the Chickamauga were Dragging Canoe's breakaway
// refuge cluster south of the negotiated Cherokee Nation border. They aren't
// inside any treaty-era polygon and shouldn't be part of the standard town
// or population-dot pipeline — they only exist for the chickamauga-war scene.
const CHICKAMAUGA_TOWN_IDS = new Set([
  'running-water',
  'nickajack',
  'long-island-town',
  'crow-town',
  'lookout-mountain-town',
]);
const NON_CHICKAMAUGA_TOWNS = towns.filter((t) => !CHICKAMAUGA_TOWN_IDS.has(t.id) && !t.foundedYear && !t.alwaysShow);
const CHICKAMAUGA_TOWNS = towns.filter((t) => CHICKAMAUGA_TOWN_IDS.has(t.id));
// Towns with a foundedYear (e.g. New Echota, est. 1825) are excluded from the
// standard pipeline and added dynamically when the scene year is >= their founding.
const YEAR_GATED_TOWNS = towns.filter((t) => t.foundedYear && !CHICKAMAUGA_TOWN_IDS.has(t.id));
// Towns that fall outside simplified territory polygons but were historically
// Cherokee country through removal (e.g. Etowah/Hightower near Rome, GA).
// Bypass polygon filtering entirely — always show as living towns.
const ALWAYS_SHOW_TOWNS = towns.filter((t) => t.alwaysShow && !CHICKAMAUGA_TOWN_IDS.has(t.id));

// Towns permanently destroyed — indexed by ID for O(1) lookup during dot filtering.
const DESTROYED_TOWN_YEARS = {};
for (const t of towns) {
  if (t.destroyedYear) DESTROYED_TOWN_YEARS[t.id] = t.destroyedYear;
}

// Pre-generate population dots for each territory stage.
// Dots are clustered at real Cherokee town locations (not randomly scattered),
// reflecting how Cherokee people actually lived — in concentrated towns
// along rivers, not spread out across the landscape.
// 1 dot = 100 people. Towns in ceded territory drop out; surviving towns
// grow denser as the total population "concentrates" in the remaining land.
const PEOPLE_PER_DOT = 100;
const POPULATION_DOTS = {};
for (const [key, geojson] of Object.entries(TERRITORY_MAP)) {
  const stageData = populationData.stages[key];
  if (stageData && geojson) {
    POPULATION_DOTS[key] = generateTownClusteredDots(
      geojson,
      NON_CHICKAMAUGA_TOWNS,
      stageData.population,
      PEOPLE_PER_DOT,
      42 + key.length
    );
  }
}
const EMPTY_FC = { type: 'FeatureCollection', features: [] };

// Pre-generate dots for year-gated towns (e.g. New Echota, est. 1825).
// Each gets a small cluster generated against the territory that was active
// at its founding year, so dots appear at the right location when the scene
// year reaches the town's founding.
const YEAR_GATED_DOTS = {};
for (const t of YEAR_GATED_TOWNS) {
  // Find the latest territory stage whose key-year <= foundedYear
  const stageKeys = Object.keys(TERRITORY_MAP)
    .filter((k) => k !== 'precontact')
    .map(Number)
    .sort((a, b) => a - b);
  let bestKey = 'precontact';
  for (const k of stageKeys) {
    if (k <= t.foundedYear) bestKey = String(k);
  }
  const geojson = TERRITORY_MAP[bestKey];
  if (!geojson) continue;
  const stageData = populationData.stages[bestKey];
  const townPop = stageData ? Math.round(stageData.population * 0.02) : 300;
  YEAR_GATED_DOTS[t.id] = generateTownClusteredDots(
    geojson,
    [t],
    townPop,
    PEOPLE_PER_DOT,
    t.foundedYear
  );
}

// Special population dots for the Chickamauga War scene: ~15,000 in the main
// Cherokee Nation (clustered at standard towns within the 1785 polygon) plus
// ~1,000 refugees clustered at the Five Lower Towns to the south. Built using
// generateTownClusteredDots with an extended town list AND an extended
// territory polygon that includes both regions.
const CHICKAMAUGA_DOTS = (() => {
  const stage1785 = TERRITORY_MAP['1785'];
  if (!stage1785) return EMPTY_FC;
  // Use a synthetic territory polygon: the 1785 territory union with a
  // generous bounding ring around the Five Lower Towns so dots clustered there
  // pass the in-polygon check.
  const refugePoly = {
    type: 'FeatureCollection',
    features: [
      ...(stage1785.features || []),
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-86.0, 34.7], [-85.3, 34.7], [-85.3, 35.2], [-86.0, 35.2], [-86.0, 34.7],
          ]],
        },
        properties: {},
      },
    ],
  };
  // Standard 1785 dots (~15,000 people in main Cherokee towns)
  const mainDots = generateTownClusteredDots(
    stage1785,
    NON_CHICKAMAUGA_TOWNS,
    15000,
    PEOPLE_PER_DOT,
    1785
  );
  // Refuge dots (~1,000 people clustered at the Five Lower Towns)
  const refugeDots = generateTownClusteredDots(
    refugePoly,
    CHICKAMAUGA_TOWNS,
    1000,
    PEOPLE_PER_DOT,
    1782
  );
  // Filter out dots clustered at towns destroyed by 1785 (Lower Towns, Mialoquo, Chestowee)
  const filteredMainFeatures = mainDots.features.filter((f) => {
    const tid = f.properties?.townId;
    if (!tid) return true;
    const dy = DESTROYED_TOWN_YEARS[tid];
    return !dy || dy > 1785;
  });
  return {
    type: 'FeatureCollection',
    features: [...filteredMainFeatures, ...refugeDots.features],
  };
})();

// Compute year-aware population dots for a given scene.
// Filters destroyed-town dots out of pre-computed POPULATION_DOTS and merges
// in founded-town dots (e.g. New Echota after 1825). Both operations are
// simple array filters on pre-computed data — no regeneration needed.
function computeDotsForScene(territoryKey, effectiveYear) {
  const base = POPULATION_DOTS[territoryKey];
  if (!base) return EMPTY_FC;
  const year = effectiveYear || 0;

  // 1. Filter out dots clustered at destroyed towns
  let features = base.features;
  const hasDestroyedTowns = Object.values(DESTROYED_TOWN_YEARS).some((dy) => dy <= year);
  if (hasDestroyedTowns) {
    features = features.filter((f) => {
      const tid = f.properties?.townId;
      if (!tid) return true;
      const dy = DESTROYED_TOWN_YEARS[tid];
      return !dy || dy > year;
    });
  }

  // 2. Merge in year-gated town dots (e.g. New Echota after 1825)
  let extras = [];
  for (const t of YEAR_GATED_TOWNS) {
    if (t.foundedYear <= year && YEAR_GATED_DOTS[t.id]) {
      extras.push(...YEAR_GATED_DOTS[t.id].features);
    }
  }

  if (extras.length === 0 && features === base.features) {
    return base; // no modifications — return original to avoid GC pressure
  }

  return {
    type: 'FeatureCollection',
    features: extras.length > 0 ? [...features, ...extras] : features,
  };
}

// Smallpox death visualization: show the SAME gold dots that will appear in 1777
// (so there's no apparent population "growth" when the user advances past the
// epidemic), plus an equal-sized set of red dying dots scattered around the
// same towns. The surviving half here is byte-for-byte identical to
// POPULATION_DOTS['1777'], guaranteeing visual continuity from 1738 → 1777.
const SMALLPOX_DOTS = (() => {
  const survivors = POPULATION_DOTS['1777'];
  if (!survivors) return EMPTY_FC;
  // Generate a matching set of DYING dots clustered around the same Cherokee towns
  // but scattered with a different seed so the red dots are visually distinct
  // from the gold survivors.
  const dyingDots = generateTownClusteredDots(
    TERRITORY_MAP['precontact'],
    NON_CHICKAMAUGA_TOWNS,
    16000, // matching the death toll (~half of the precontact 32k population)
    PEOPLE_PER_DOT,
    1738   // smallpox seed
  );
  return {
    type: 'FeatureCollection',
    features: [
      // Gold survivors — IDENTICAL to POPULATION_DOTS['1777'], so they don't
      // jump positions when the user advances out of the smallpox scene
      ...survivors.features.map((f) => ({
        ...f,
        properties: { ...f.properties, dying: false },
      })),
      // Red dying dots — clustered around the same towns, but with their own
      // gaussian scatter so they read as separate from the survivors
      ...dyingDots.features.map((f) => ({
        ...f,
        properties: { ...f.properties, dying: true },
      })),
    ],
  };
})();

// Build route GeoJSON from waypoints
const ROUTE_WAYPOINTS = {
  'northern-overland': [
    [-84.86, 35.29], [-84.95, 35.38], [-85.76, 35.68], [-86.78, 36.16],
    [-87.49, 36.87], [-87.68, 37.11], [-88.37, 37.15], [-88.49, 37.37],
    [-89.46, 37.45], [-89.52, 37.38], [-90.42, 37.56], [-91.83, 37.95],
    [-92.20, 37.83], [-93.29, 37.21], [-94.63, 35.81], [-94.97, 35.92],
  ],
  benge: [
    [-85.72, 34.44], [-85.76, 35.10], [-86.78, 36.16], [-87.49, 36.87],
    [-88.90, 36.73], [-90.18, 36.50], [-91.65, 35.94], [-92.46, 35.75],
    [-93.13, 36.06], [-93.74, 36.18], [-94.17, 36.07], [-94.63, 35.81],
  ],
  bell: [
    [-85.31, 35.05], [-87.03, 35.20], [-90.05, 35.15], [-90.85, 35.12],
    [-91.80, 35.25], [-93.60, 35.70], [-94.63, 35.81],
  ],
  water: [
    [-84.86, 35.29], [-85.31, 35.05], [-86.30, 34.35], [-87.66, 34.92],
    [-88.49, 37.37], [-89.46, 37.45], [-90.10, 36.50], [-91.10, 35.80],
    [-92.29, 34.75], [-94.39, 35.37],
  ],
};

function buildRouteGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: Object.entries(ROUTE_WAYPOINTS).map(([route, coords]) => ({
      type: 'Feature',
      properties: { route, color: ROUTE_COLORS[route] },
      geometry: { type: 'LineString', coordinates: coords },
    })),
  };
}

// Pre-generate the 6 migration frames for the Trail of Tears animation
// Frame 0: Roundup at forts
// Frames 1-5: Dots move along routes from east to west
// Totals: 80 dots (16,000 / 200), 20 die during journey
const MIGRATION_FRAMES = generateMigrationFrames(ROUTE_WAYPOINTS, forts, 80, 20);

function buildTownsGeoJSON(townsList = towns) {
  return {
    type: 'FeatureCollection',
    features: townsList.map((t) => ({
      type: 'Feature',
      properties: {
        id: t.id,
        name: t.name,
        cherokeeName: t.cherokeeName,
        syllabary: t.syllabary,
        hasSyllabary: Boolean(t.syllabary),
        division: t.division,
        significance: t.significance,
        status: t.status,
        isCapital: Boolean(t.isCapital),
        color: DIVISION_COLORS[t.division] || '#888',
      },
      geometry: { type: 'Point', coordinates: [t.lon, t.lat] },
    })),
  };
}

// Compute living and lost Cherokee towns for a given scene.
// This single function handles ALL lifecycle cases:
//   1. Territory polygon filtering (towns in ceded land → lost)
//   2. destroyedYear (towns burned/abandoned → lost after that year)
//   3. foundedYear (towns not yet built → invisible before that year)
//   4. Chickamauga Five Lower Towns (alive 1780-1794, destroyed after)
//   5. Year-gated towns like New Echota (appear at foundedYear)
function computeTownsForScene(territoryKey, effectiveYear) {
  const year = effectiveYear || 0;
  const geojson = TERRITORY_MAP[territoryKey];
  if (!geojson) return { living: buildTownsGeoJSON([]), lost: buildTownsGeoJSON([]) };

  // Filter base towns by territory polygon
  const insideTowns = filterTownsInPolygon(NON_CHICKAMAUGA_TOWNS, geojson);
  const insideIds = new Set(insideTowns.map((t) => t.id));
  const outsideTowns = NON_CHICKAMAUGA_TOWNS.filter((t) => !insideIds.has(t.id));

  // Year-aware lifecycle filtering
  const living = insideTowns.filter((t) => {
    if (t.foundedYear && t.foundedYear > year) return false; // not yet built
    if (t.destroyedYear && t.destroyedYear <= year) return false; // destroyed
    return true;
  });

  const lost = [
    // Towns outside territory (ceded land) — but only if they existed by this year
    ...outsideTowns.filter((t) => {
      if (t.foundedYear && t.foundedYear > year) return false;
      return true;
    }),
    // Towns inside territory but permanently destroyed before this year
    ...insideTowns.filter((t) => {
      if (t.foundedYear && t.foundedYear > year) return false;
      return t.destroyedYear && t.destroyedYear <= year;
    }),
  ];

  // Five Lower Towns: alive 1780-1794, destroyed after 1794
  if (year >= 1780 && year <= 1794) {
    living.push(...CHICKAMAUGA_TOWNS);
  } else if (year > 1794) {
    lost.push(...CHICKAMAUGA_TOWNS);
  }

  // Year-gated towns (e.g. New Echota, est. 1825)
  for (const t of YEAR_GATED_TOWNS) {
    if (t.foundedYear > year) continue; // not yet built
    if (t.destroyedYear && t.destroyedYear <= year) {
      lost.push(t);
    } else {
      living.push(t);
    }
  }

  // Always-show towns bypass polygon filtering (e.g. Etowah/Hightower,
  // Nacoochee — historically Cherokee through removal but outside our
  // simplified territory polygons)
  for (const t of ALWAYS_SHOW_TOWNS) {
    if (t.destroyedYear && t.destroyedYear <= year) {
      lost.push(t);
    } else {
      living.push(t);
    }
  }

  return {
    living: buildTownsGeoJSON(living),
    lost: buildTownsGeoJSON(lost),
  };
}

// Settler town pipeline — colonial settlements, forts, and frontier towns
// that appear on the map at their founding year and persist through the rest
// of the timeline. Year-filtered per scene so the user watches the encroaching
// settler world build up around the shrinking Cherokee Nation.
//
// Mapbox feature properties only support primitive scalars reliably, so the
// rich `nativeEvents` array is JSON-encoded on the way in and parsed back out
// in the click handler.
function buildSettlerTownsGeoJSON(townList) {
  return {
    type: 'FeatureCollection',
    features: townList.map((t) => ({
      type: 'Feature',
      properties: {
        id: t.id,
        name: t.name,
        state: t.state,
        foundedYear: t.foundedYear,
        kind: t.kind,
        shortNote: t.shortNote,
        founding: t.founding || '',
        nativeEvents: JSON.stringify(t.nativeEvents || []),
        today: t.today || '',
        source: t.source,
      },
      geometry: { type: 'Point', coordinates: [t.lon, t.lat] },
    })),
  };
}

// Pre-build the settler-town feature collection for every scene's effective
// year. Each scene only sees settlements that already existed by that year —
// so c.1700 shows just Jamestown / Charles Town / Williamsburg, while 1838
// shows the whole list. Pre-computed at module load so scene transitions are
// just a setData call.
const SETTLER_TOWNS_BY_YEAR = (() => {
  const result = {};
  // Build a unique sorted list of effective years used in scenes
  const years = new Set();
  for (const scene of SCENES) {
    if (typeof scene.effectiveYear === 'number') years.add(scene.effectiveYear);
  }
  for (const year of years) {
    const visible = settlerTowns.filter((t) => t.foundedYear <= year);
    result[year] = buildSettlerTownsGeoJSON(visible);
  }
  return result;
})();

// Fallback: full list (used when a scene has no effectiveYear, or for debug)
const SETTLER_TOWNS_ALL_FC = buildSettlerTownsGeoJSON(settlerTowns);

// Resolve a scene's effective year to a settler-towns FeatureCollection.
// If the year isn't pre-computed, fall back to filtering the full list inline.
function settlerTownsForYear(year) {
  if (typeof year !== 'number') return SETTLER_TOWNS_ALL_FC;
  if (SETTLER_TOWNS_BY_YEAR[year]) return SETTLER_TOWNS_BY_YEAR[year];
  return buildSettlerTownsGeoJSON(settlerTowns.filter((t) => t.foundedYear <= year));
}

function buildFortsGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: forts.map((f) => ({
      type: 'Feature',
      properties: {
        id: f.id,
        name: f.name,
        location: f.location,
        notes: f.notes,
      },
      geometry: { type: 'Point', coordinates: [f.lon, f.lat] },
    })),
  };
}

function buildWaypointsGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: waypoints.map((w) => ({
      type: 'Feature',
      properties: {
        id: w.id,
        name: w.name,
        location: w.location,
        significance: w.significance,
      },
      geometry: { type: 'Point', coordinates: [w.lon, w.lat] },
    })),
  };
}

// Stylized Cherokee council house icons, loaded into Mapbox as image sprites.
// A 7-sided roof above a plaza, with a sacred fire dot in the center — a
// simplified representation of the traditional domed council house (asi)
// that stood at the center of every Cherokee town.
const VILLAGE_SVG_REGULAR = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    <!-- Plaza ground ellipse -->
    <ellipse cx="32" cy="48" rx="22" ry="4" fill="rgba(15,23,42,0.65)" stroke="#fef3c7" stroke-width="1.2" opacity="0.9"/>
    <!-- Dome body -->
    <path d="M 12 48 Q 12 18 32 18 Q 52 18 52 48 Z"
          fill="#fef3c7" stroke="#0a0f1a" stroke-width="2.2"/>
    <!-- Interior shading -->
    <path d="M 12 48 Q 12 18 32 18 Q 52 18 52 48 Z"
          fill="url(#domeShade)" opacity="0.35"/>
    <!-- Doorway -->
    <path d="M 26 48 L 26 38 Q 32 34 38 38 L 38 48 Z" fill="#0a0f1a"/>
    <!-- Sacred fire glow at center door -->
    <circle cx="32" cy="44" r="1.8" fill="#fbbf24"/>
    <!-- Smoke hole at apex -->
    <circle cx="32" cy="20" r="2.2" fill="#0a0f1a"/>
    <!-- Seven vertical supports suggesting the 7 clans -->
    <line x1="17" y1="46" x2="19" y2="30" stroke="#0a0f1a" stroke-width="0.9" opacity="0.45"/>
    <line x1="22" y1="48" x2="23" y2="24" stroke="#0a0f1a" stroke-width="0.9" opacity="0.45"/>
    <line x1="32" y1="48" x2="32" y2="22" stroke="#0a0f1a" stroke-width="0.9" opacity="0.45"/>
    <line x1="42" y1="48" x2="41" y2="24" stroke="#0a0f1a" stroke-width="0.9" opacity="0.45"/>
    <line x1="47" y1="46" x2="45" y2="30" stroke="#0a0f1a" stroke-width="0.9" opacity="0.45"/>
  </g>
  <defs>
    <radialGradient id="domeShade" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#78350f" stop-opacity="0.8"/>
    </radialGradient>
  </defs>
</svg>
`.trim();

// A "lost" village — darkened, no sacred fire, dashed plaza suggesting absence.
// Used for Cherokee towns in territory that has been ceded in a treaty.
const VILLAGE_SVG_LOST = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    <!-- Dashed plaza — a place that used to be a town -->
    <ellipse cx="32" cy="48" rx="22" ry="4" fill="rgba(12,16,26,0.88)" stroke="#991b1b" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.95"/>
    <!-- Dome body, dark charcoal -->
    <path d="M 12 48 Q 12 18 32 18 Q 52 18 52 48 Z"
          fill="#1c1917" stroke="#7f1d1d" stroke-width="2.2"/>
    <!-- Interior shading -->
    <path d="M 12 48 Q 12 18 32 18 Q 52 18 52 48 Z"
          fill="#000000" opacity="0.55"/>
    <!-- Empty doorway — the fire has gone out -->
    <path d="M 25 48 L 25 38 Q 32 34 39 38 L 39 48 Z" fill="#0a0f1a"/>
    <!-- Extinguished smoke hole — covered in ash -->
    <circle cx="32" cy="20" r="2.2" fill="#450a0a"/>
    <!-- Broken support posts -->
    <line x1="17" y1="46" x2="19" y2="30" stroke="#7f1d1d" stroke-width="0.9" opacity="0.45"/>
    <line x1="22" y1="48" x2="23" y2="24" stroke="#7f1d1d" stroke-width="0.9" opacity="0.45"/>
    <line x1="32" y1="48" x2="32" y2="22" stroke="#7f1d1d" stroke-width="0.9" opacity="0.45"/>
    <line x1="42" y1="48" x2="41" y2="24" stroke="#7f1d1d" stroke-width="0.9" opacity="0.45"/>
    <line x1="47" y1="46" x2="45" y2="30" stroke="#7f1d1d" stroke-width="0.9" opacity="0.45"/>
  </g>
</svg>
`.trim();

const VILLAGE_SVG_CAPITAL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g fill="none" stroke-linejoin="round" stroke-linecap="round">
    <!-- Outer halo indicating importance -->
    <circle cx="32" cy="34" r="30" fill="#fbbf24" opacity="0.08"/>
    <circle cx="32" cy="34" r="26" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.35" stroke-dasharray="2,2"/>
    <!-- Plaza ground ellipse -->
    <ellipse cx="32" cy="50" rx="24" ry="4.5" fill="rgba(15,23,42,0.7)" stroke="#fbbf24" stroke-width="1.5" opacity="0.95"/>
    <!-- Main dome -->
    <path d="M 10 50 Q 10 14 32 14 Q 54 14 54 50 Z"
          fill="#fef3c7" stroke="#0a0f1a" stroke-width="2.5"/>
    <!-- Interior shading -->
    <path d="M 10 50 Q 10 14 32 14 Q 54 14 54 50 Z"
          fill="url(#domeShadeCap)" opacity="0.4"/>
    <!-- Prominent doorway -->
    <path d="M 25 50 L 25 38 Q 32 34 39 38 L 39 50 Z" fill="#0a0f1a"/>
    <!-- Sacred fire -->
    <circle cx="32" cy="44" r="2.5" fill="#fbbf24"/>
    <circle cx="32" cy="44" r="1.2" fill="#fef9c3"/>
    <!-- Smoke hole at apex with smoke -->
    <circle cx="32" cy="16" r="2.8" fill="#0a0f1a"/>
    <!-- Support posts -->
    <line x1="14" y1="48" x2="17" y2="28" stroke="#0a0f1a" stroke-width="1.1" opacity="0.5"/>
    <line x1="20" y1="50" x2="22" y2="20" stroke="#0a0f1a" stroke-width="1.1" opacity="0.5"/>
    <line x1="32" y1="50" x2="32" y2="18" stroke="#0a0f1a" stroke-width="1.1" opacity="0.5"/>
    <line x1="44" y1="50" x2="42" y2="20" stroke="#0a0f1a" stroke-width="1.1" opacity="0.5"/>
    <line x1="50" y1="48" x2="47" y2="28" stroke="#0a0f1a" stroke-width="1.1" opacity="0.5"/>
  </g>
  <defs>
    <radialGradient id="domeShadeCap" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#78350f" stop-opacity="0.85"/>
    </radialGradient>
  </defs>
</svg>
`.trim();

function svgToImage(svg, size = 64) {
  return new Promise((resolve, reject) => {
    const img = new Image(size, size);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

// Stockade fort icon — square palisade with corner posts, door, and flag.
// These were the actual U.S. military structures used to round up Cherokee
// for removal in 1838.
const FORT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g stroke-linejoin="round" stroke-linecap="round">
    <!-- Square stockade walls -->
    <rect x="14" y="26" width="36" height="28" fill="#7f1d1d" stroke="#fef3c7" stroke-width="2.5"/>
    <!-- Vertical palisade post details -->
    <line x1="20" y1="30" x2="20" y2="52" stroke="#fef3c7" stroke-width="0.9" opacity="0.55"/>
    <line x1="26" y1="30" x2="26" y2="52" stroke="#fef3c7" stroke-width="0.9" opacity="0.55"/>
    <line x1="32" y1="30" x2="32" y2="52" stroke="#fef3c7" stroke-width="0.9" opacity="0.55"/>
    <line x1="38" y1="30" x2="38" y2="52" stroke="#fef3c7" stroke-width="0.9" opacity="0.55"/>
    <line x1="44" y1="30" x2="44" y2="52" stroke="#fef3c7" stroke-width="0.9" opacity="0.55"/>
    <!-- Door / opening -->
    <rect x="29" y="42" width="6" height="12" fill="#0a0f1a"/>
    <!-- Corner bastions (small squares at corners) -->
    <rect x="11" y="23" width="6" height="6" fill="#7f1d1d" stroke="#fef3c7" stroke-width="1.5"/>
    <rect x="47" y="23" width="6" height="6" fill="#7f1d1d" stroke="#fef3c7" stroke-width="1.5"/>
    <!-- Flag pole -->
    <line x1="14" y1="26" x2="14" y2="10" stroke="#fef3c7" stroke-width="1.5"/>
    <!-- Flag (red, indicating military) -->
    <path d="M 14 10 L 26 14 L 14 18 Z" fill="#dc2626" stroke="#fef3c7" stroke-width="1.2"/>
  </g>
</svg>
`.trim();

async function loadFortIcon(m) {
  try {
    const img = await svgToImage(FORT_SVG, 64);
    if (!m.hasImage('fort-stockade')) {
      m.addImage('fort-stockade', img, { pixelRatio: 2 });
    }
  } catch (e) {
    console.warn('Fort icon failed to load', e);
  }
}

// Settler town icon — colonial pitched-roof house with a chimney. Visually
// distinct from the Cherokee council house (which is domed), so the encroaching
// settler world reads as a different category at a glance. Pale stone color
// keeps it visible on the dark map without competing with the gold of Cherokee
// towns or the red of forts.
const SETTLER_TOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g stroke-linejoin="round" stroke-linecap="round">
    <!-- House body -->
    <rect x="18" y="32" width="28" height="20" fill="#e7e5e4" stroke="#1c1917" stroke-width="2"/>
    <!-- Pitched roof -->
    <path d="M 14 32 L 32 16 L 50 32 Z" fill="#a8a29e" stroke="#1c1917" stroke-width="2"/>
    <!-- Chimney -->
    <rect x="40" y="18" width="5" height="10" fill="#78716c" stroke="#1c1917" stroke-width="1.5"/>
    <!-- Door -->
    <rect x="29" y="40" width="6" height="12" fill="#1c1917"/>
    <!-- Door knob -->
    <circle cx="33.5" cy="46" r="0.6" fill="#e7e5e4"/>
    <!-- Window left -->
    <rect x="21" y="36" width="5" height="5" fill="#1c1917" stroke="#e7e5e4" stroke-width="0.6"/>
    <line x1="23.5" y1="36" x2="23.5" y2="41" stroke="#e7e5e4" stroke-width="0.6"/>
    <line x1="21" y1="38.5" x2="26" y2="38.5" stroke="#e7e5e4" stroke-width="0.6"/>
    <!-- Window right -->
    <rect x="38" y="36" width="5" height="5" fill="#1c1917" stroke="#e7e5e4" stroke-width="0.6"/>
    <line x1="40.5" y1="36" x2="40.5" y2="41" stroke="#e7e5e4" stroke-width="0.6"/>
    <line x1="38" y1="38.5" x2="43" y2="38.5" stroke="#e7e5e4" stroke-width="0.6"/>
  </g>
</svg>
`.trim();

async function loadSettlerTownIcon(m) {
  try {
    const img = await svgToImage(SETTLER_TOWN_SVG, 64);
    if (!m.hasImage('settler-town')) {
      m.addImage('settler-town', img, { pixelRatio: 2 });
    }
  } catch (e) {
    console.warn('Settler town icon failed to load', e);
  }
}

async function loadVillageIcons(m) {
  try {
    const [regular, capital, lost] = await Promise.all([
      svgToImage(VILLAGE_SVG_REGULAR, 64),
      svgToImage(VILLAGE_SVG_CAPITAL, 64),
      svgToImage(VILLAGE_SVG_LOST, 64),
    ]);
    if (!m.hasImage('village-regular')) {
      m.addImage('village-regular', regular, { pixelRatio: 2 });
    }
    if (!m.hasImage('village-capital')) {
      m.addImage('village-capital', capital, { pixelRatio: 2 });
    }
    if (!m.hasImage('village-lost')) {
      m.addImage('village-lost', lost, { pixelRatio: 2 });
    }
  } catch (e) {
    // If loading fails, the symbol layer simply won't render its icon
    // but the underlying plaza circle + glow layers still communicate town positions.
    console.warn('Village icons failed to load', e);
  }
}


export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapReady = useRef(false);
  const popupRef = useRef(null);
  const viewRef = useRef(null);
  const sceneIndexRef = useRef(0);
  const { state, dispatch } = useApp();

  // Keep refs in sync so the map load handler can read current values
  viewRef.current = state.activeView;
  sceneIndexRef.current = state.currentSceneIndex;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.warn('Mapbox token not set');
      return;
    }

    mapboxgl.accessToken = token;

    const initScene = SCENES[sceneIndexRef.current] || SCENES[0];
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initScene?.map?.center || [-84.5, 35.5],
      zoom: initScene?.map?.zoom || 5.5,
      attributionControl: false,
    });

    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');
    m.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    m.on('load', () => {
      mapReady.current = true;

      // Terrain source — gives the Appalachian homeland real 3D relief
      m.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      m.setTerrain({ source: 'mapbox-dem', exaggeration: 1.6 });

      // Atmospheric fog at horizon for depth
      m.setFog({
        color: 'rgb(20, 30, 50)',
        'high-color': 'rgb(15, 20, 40)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(8, 12, 24)',
        'star-intensity': 0.15,
      });

      // Hillshade layer for subtle mountain shading on the base style
      m.addSource('hillshade-src', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      m.addLayer({
        id: 'custom-hillshade',
        type: 'hillshade',
        source: 'hillshade-src',
        paint: {
          'hillshade-exaggeration': 0.5,
          'hillshade-shadow-color': '#0a0f1a',
          'hillshade-highlight-color': '#6b8e9e',
          'hillshade-accent-color': '#2d5a47',
        },
      }, 'land-structure-polygon');

      // Boost visibility of Mapbox's built-in water and waterway layers —
      // rivers are central to Cherokee life and we want them prominent.
      try {
        if (m.getLayer('water')) {
          m.setPaintProperty('water', 'fill-color', '#1e4e7a');
        }
        // Waterway lines (rivers/streams) — make them more visible in blue
        const waterwayLayers = ['waterway', 'waterway-shadow', 'waterway-river', 'waterway-stream', 'waterway-stream-canal'];
        for (const id of waterwayLayers) {
          if (m.getLayer(id)) {
            m.setPaintProperty(id, 'line-color', '#4a90c2');
            m.setPaintProperty(id, 'line-opacity', 0.85);
          }
        }
      } catch (e) {
        // Style layer names vary across Mapbox styles; silently skip if missing
      }

      // Colonial claim polygons — European powers dividing the continent.
      // Filtered by scene.effectiveYear so claims appear/disappear at the
      // correct historical moments (Spanish Florida vanishes after 1763,
      // etc.). The layers are placed UNDER the Cherokee content so they
      // form a contextual backdrop, not a foreground element.
      m.addSource('colonial-claims', { type: 'geojson', data: colonialClaims });
      m.addLayer({
        id: 'colonial-claims-fill',
        type: 'fill',
        source: 'colonial-claims',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': ['get', 'color'],
          // Disputed territory gets a higher opacity so it clearly reads as
          // a distinct zone, not just an overlap between French and British.
          'fill-opacity': ['case', ['==', ['get', 'id'], 'disputed-territory'], 0.22, 0.14],
        },
      });
      m.addLayer({
        id: 'colonial-claims-line',
        type: 'line',
        source: 'colonial-claims',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['case', ['==', ['get', 'id'], 'disputed-territory'], 2.2, 1.8],
          'line-opacity': 0.7,
          'line-dasharray': ['case', ['==', ['get', 'id'], 'disputed-territory'], ['literal', [2, 2]], ['literal', [4, 2]]],
        },
      });
      m.addLayer({
        id: 'colonial-claims-label',
        type: 'symbol',
        source: 'colonial-claims',
        filter: ['==', ['geometry-type'], 'Polygon'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 12, 7, 16, 10, 20],
          'text-font': ['DIN Pro Italic', 'Arial Unicode MS Regular'],
          'text-letter-spacing': 0.12,
          'text-transform': 'uppercase',
          'symbol-placement': 'point',
          'text-optional': true,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 2,
          'text-opacity': 0.75,
        },
      });

      // 1763 Proclamation Line — LineString, dashed gold
      m.addLayer({
        id: 'colonial-line-glow',
        type: 'line',
        source: 'colonial-claims',
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 8,
          'line-opacity': 0.2,
          'line-blur': 4,
        },
      });
      m.addLayer({
        id: 'colonial-line-main',
        type: 'line',
        source: 'colonial-claims',
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.2,
          'line-opacity': 0.9,
          'line-dasharray': [6, 3],
        },
      });
      m.addLayer({
        id: 'colonial-line-label',
        type: 'symbol',
        source: 'colonial-claims',
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-font': ['DIN Pro Italic', 'Arial Unicode MS Regular'],
          'symbol-placement': 'line',
          'symbol-spacing': 320,
          'text-letter-spacing': 0.05,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 2,
        },
      });

      // Battle sites — for visualizing military events like Horseshoe Bend.
      // Stored as a single source with a `battleId` property so we can filter
      // to show only the battle relevant to the current scene.
      m.addSource('battle-sites', { type: 'geojson', data: battleSites });

      // Enemy zone fill (where the defenders were positioned)
      m.addLayer({
        id: 'battle-enemy-zone',
        type: 'fill',
        source: 'battle-sites',
        filter: ['==', ['get', 'kind'], 'enemy-zone'],
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.35,
        },
      });
      m.addLayer({
        id: 'battle-enemy-zone-line',
        type: 'line',
        source: 'battle-sites',
        filter: ['==', ['get', 'kind'], 'enemy-zone'],
        paint: {
          'line-color': '#dc2626',
          'line-width': 2,
          'line-opacity': 0.85,
          'line-dasharray': [3, 1.5],
        },
      });

      // Force movement arrows (linestrings showing army advances)
      m.addLayer({
        id: 'battle-arrow-glow',
        type: 'line',
        source: 'battle-sites',
        filter: ['any',
          ['==', ['get', 'kind'], 'advance-arrow'],
          ['==', ['get', 'kind'], 'flank-arrow'],
        ],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 14,
          'line-opacity': 0.18,
          'line-blur': 4,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });
      m.addLayer({
        id: 'battle-arrow-line',
        type: 'line',
        source: 'battle-sites',
        filter: ['any',
          ['==', ['get', 'kind'], 'advance-arrow'],
          ['==', ['get', 'kind'], 'flank-arrow'],
        ],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4.5,
          'line-opacity': 0.95,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });

      // Force position labels (Jackson, Cherokee, Red Stick)
      m.addLayer({
        id: 'battle-force-label',
        type: 'symbol',
        source: 'battle-sites',
        filter: ['==', ['get', 'kind'], 'force-label'],
        layout: {
          'text-field': ['get', 'label'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 11, 12, 14],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 2.5,
        },
      });

      // Battle marker — large central icon at the battle site
      m.addLayer({
        id: 'battle-marker-glow',
        type: 'circle',
        source: 'battle-sites',
        filter: ['==', ['get', 'kind'], 'battle-marker'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 16, 12, 28],
          'circle-color': '#ef4444',
          'circle-opacity': 0.18,
          'circle-blur': 0.6,
        },
      });
      m.addLayer({
        id: 'battle-marker-circle',
        type: 'circle',
        source: 'battle-sites',
        filter: ['==', ['get', 'kind'], 'battle-marker'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 6, 12, 10],
          'circle-color': '#dc2626',
          'circle-stroke-color': '#fef3c7',
          'circle-stroke-width': 2,
        },
      });
      m.addLayer({
        id: 'battle-marker-label',
        type: 'symbol',
        source: 'battle-sites',
        filter: ['==', ['get', 'kind'], 'battle-marker'],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 12, 12, 16],
          'text-offset': [0, 1.6],
          'text-anchor': 'top',
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#fef2f2',
          'text-halo-color': 'rgba(0,0,0,0.95)',
          'text-halo-width': 2.5,
        },
      });

      // Cherokee river labels — named points with Cherokee names where known
      m.addSource('cherokee-rivers', { type: 'geojson', data: cherokeeRivers });
      m.addLayer({
        id: 'cherokee-rivers-label',
        type: 'symbol',
        source: 'cherokee-rivers',
        layout: {
          'text-field': [
            'case',
            ['has', 'cherokeeName'],
            ['concat',
              ['get', 'englishName'],
              '\n',
              ['get', 'cherokeeName'],
            ],
            ['get', 'englishName'],
          ],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 10, 9, 13],
          'text-font': ['DIN Pro Italic', 'Arial Unicode MS Regular'],
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-letter-spacing': 0.04,
          'text-optional': true,
        },
        paint: {
          'text-color': '#93c5fd',
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 2.5,
        },
      });

      // Ghost territory (original extent, always visible)
      m.addSource('territory-ghost', {
        type: 'geojson',
        data: territoryPrecontact,
      });
      m.addLayer({
        id: 'territory-ghost-fill',
        type: 'fill',
        source: 'territory-ghost',
        paint: {
          'fill-color': COLORS.territoryOriginal,
          'fill-opacity': 0.08,
        },
      });
      m.addLayer({
        id: 'territory-ghost-line',
        type: 'line',
        source: 'territory-ghost',
        paint: {
          'line-color': COLORS.territoryOriginal,
          'line-opacity': 0.35,
          'line-width': 2,
          'line-dasharray': [6, 4],
        },
      });

      // Current territory
      m.addSource('territory-current', {
        type: 'geojson',
        data: territoryPrecontact,
      });
      m.addLayer({
        id: 'territory-current-fill',
        type: 'fill',
        source: 'territory-current',
        paint: {
          'fill-color': COLORS.territoryCurrent,
          'fill-opacity': 0.3,
        },
      });
      m.addLayer({
        id: 'territory-current-line',
        type: 'line',
        source: 'territory-current',
        paint: {
          'line-color': COLORS.territoryCurrent,
          'line-opacity': 0.7,
          'line-width': 2,
        },
      });
      m.addLayer({
        id: 'territory-current-glow',
        type: 'line',
        source: 'territory-current',
        paint: {
          'line-color': COLORS.territoryCurrent,
          'line-opacity': 0.15,
          'line-width': 8,
          'line-blur': 6,
        },
      });

      // Population dots — color changes based on "dying" property during migration
      m.addSource('population-dots', { type: 'geojson', data: POPULATION_DOTS['precontact'] || EMPTY_FC });
      m.addLayer({
        id: 'population-dots-glow',
        type: 'circle',
        source: 'population-dots',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 4, 7, 7, 10, 10],
          'circle-color': ['case', ['==', ['get', 'dying'], true], '#dc2626', '#fbbf24'],
          'circle-opacity': ['case', ['==', ['get', 'dying'], true], 0.25, 0.12],
          'circle-stroke-width': 0,
        },
      });
      m.addLayer({
        id: 'population-dots-circle',
        type: 'circle',
        source: 'population-dots',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 7, 2.5, 10, 4],
          'circle-color': ['case', ['==', ['get', 'dying'], true], '#dc2626', '#fbbf24'],
          'circle-opacity': ['case', ['==', ['get', 'dying'], true], 0.95, 0.7],
          'circle-stroke-width': 0,
        },
      });

      // Towns — glow under, division-colored plaza, village-icon hut on top
      m.addSource('towns', { type: 'geojson', data: computeTownsForScene('precontact', 1700).living });

      // Load the village icon (stylized Cherokee council house) into the map
      loadVillageIcons(m);

      // Background glow in the division color
      m.addLayer({
        id: 'towns-glow',
        type: 'circle',
        source: 'towns',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['case', ['get', 'isCapital'], 16, 12],
            7, ['case', ['get', 'isCapital'], 26, 20],
            10, ['case', ['get', 'isCapital'], 38, 30]
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.22,
          'circle-stroke-width': 0,
          'circle-blur': 0.5,
        },
      });

      // Plaza ring — dark circle behind the icon, division color stroke
      m.addLayer({
        id: 'towns-plaza',
        type: 'circle',
        source: 'towns',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['case', ['get', 'isCapital'], 8, 6],
            7, ['case', ['get', 'isCapital'], 15, 12],
            10, ['case', ['get', 'isCapital'], 22, 18]
          ],
          'circle-color': 'rgba(10, 15, 26, 0.85)',
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-width': ['case', ['get', 'isCapital'], 2.5, 1.5],
          'circle-stroke-opacity': 0.9,
        },
      });

      // Village icon — a stylized council house shape (SDF sprite we register below)
      m.addLayer({
        id: 'towns-icon',
        type: 'symbol',
        source: 'towns',
        layout: {
          'icon-image': ['case', ['get', 'isCapital'], 'village-capital', 'village-regular'],
          'icon-size': ['interpolate', ['linear'], ['zoom'],
            5, ['case', ['get', 'isCapital'], 0.42, 0.32],
            7, ['case', ['get', 'isCapital'], 0.72, 0.56],
            10, ['case', ['get', 'isCapital'], 1.05, 0.82]
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'symbol-sort-key': ['case', ['get', 'isCapital'], 2, 1],
        },
      });
      // Primary label — Cherokee syllabary if available, otherwise English
      m.addLayer({
        id: 'towns-label',
        type: 'symbol',
        source: 'towns',
        layout: {
          'text-field': ['coalesce', ['get', 'syllabary'], ['get', 'name']],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 8, 14, 10, 18],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-optional': true,
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#fef3c7',
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 2,
        },
      });
      // Secondary label — English name below the syllabary (only for towns with syllabary)
      m.addLayer({
        id: 'towns-label-english',
        type: 'symbol',
        source: 'towns',
        filter: ['==', ['get', 'hasSyllabary'], true],
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 9, 8, 11, 10, 13],
          'text-offset': [0, 2.8],
          'text-anchor': 'top',
          'text-optional': true,
          'text-font': ['DIN Pro Italic', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#94a3b8',
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 1.5,
        },
      });

      // =====================================================================
      // LOST TOWNS — villages in territory ceded by a treaty.
      // Same source pattern as towns, but styled dark/burnt/red to make the
      // loss visible and impactful, not just invisible.
      // =====================================================================
      m.addSource('towns-lost', { type: 'geojson', data: EMPTY_FC });

      // Dark red glow (bleeding out from a lost place)
      m.addLayer({
        id: 'towns-lost-glow',
        type: 'circle',
        source: 'towns-lost',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['case', ['get', 'isCapital'], 16, 12],
            7, ['case', ['get', 'isCapital'], 26, 20],
            10, ['case', ['get', 'isCapital'], 38, 30]
          ],
          'circle-color': '#7f1d1d',
          'circle-opacity': 0.22,
          'circle-stroke-width': 0,
          'circle-blur': 0.6,
        },
      });

      // Dashed dark plaza ring indicating a place that used to be
      m.addLayer({
        id: 'towns-lost-plaza',
        type: 'circle',
        source: 'towns-lost',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, ['case', ['get', 'isCapital'], 8, 6],
            7, ['case', ['get', 'isCapital'], 15, 12],
            10, ['case', ['get', 'isCapital'], 22, 18]
          ],
          'circle-color': 'rgba(10, 10, 15, 0.9)',
          'circle-stroke-color': '#991b1b',
          'circle-stroke-width': 1.8,
          'circle-stroke-opacity': 0.85,
        },
      });

      // The "lost village" icon — dark ruined version of the council house
      m.addLayer({
        id: 'towns-lost-icon',
        type: 'symbol',
        source: 'towns-lost',
        layout: {
          'icon-image': 'village-lost',
          'icon-size': ['interpolate', ['linear'], ['zoom'],
            5, ['case', ['get', 'isCapital'], 0.42, 0.32],
            7, ['case', ['get', 'isCapital'], 0.72, 0.56],
            10, ['case', ['get', 'isCapital'], 1.05, 0.82]
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'symbol-sort-key': 0,
        },
        paint: {
          'icon-opacity': 0.85,
        },
      });

      // Dimmed label for lost towns (faint dark red, serif italic)
      m.addLayer({
        id: 'towns-lost-label',
        type: 'symbol',
        source: 'towns-lost',
        layout: {
          'text-field': ['coalesce', ['get', 'syllabary'], ['get', 'name']],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 10, 8, 12, 10, 14],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-optional': true,
          'text-font': ['DIN Pro Italic', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#fca5a5',
          'text-halo-color': 'rgba(0,0,0,0.95)',
          'text-halo-width': 2,
          'text-opacity': 0.75,
        },
      });

      // =====================================================================
      // SETTLER TOWNS — colonial settlements that appear as the timeline
      // advances. Year-filtered per scene so the user watches the encroaching
      // settler world build up around the shrinking Cherokee Nation.
      // =====================================================================
      m.addSource('settler-towns', { type: 'geojson', data: SETTLER_TOWNS_BY_YEAR[1700] || EMPTY_FC });
      loadSettlerTownIcon(m);

      // Background glow — warm white, same scale as Cherokee town glows
      m.addLayer({
        id: 'settler-towns-glow',
        type: 'circle',
        source: 'settler-towns',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, 12, 7, 20, 10, 30
          ],
          'circle-color': '#e2e8f0',
          'circle-opacity': 0.2,
          'circle-blur': 0.5,
        },
      });

      // Plaza ring — dark circle with pale stroke, matching Cherokee town plaza scale
      m.addLayer({
        id: 'settler-towns-circle',
        type: 'circle',
        source: 'settler-towns',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            5, 6, 7, 12, 10, 18
          ],
          'circle-color': 'rgba(15, 18, 25, 0.85)',
          'circle-stroke-color': '#e2e8f0',
          'circle-stroke-width': 1.8,
          'circle-stroke-opacity': 0.9,
        },
      });

      // Pitched-roof colonial house icon — same scale as Cherokee council house
      m.addLayer({
        id: 'settler-towns-icon',
        type: 'symbol',
        source: 'settler-towns',
        layout: {
          'icon-image': 'settler-town',
          'icon-size': ['interpolate', ['linear'], ['zoom'],
            5, 0.32, 7, 0.56, 10, 0.82
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'symbol-sort-key': 0,
        },
      });

      // Label below the icon — pale stone color, smaller than Cherokee town labels
      m.addLayer({
        id: 'settler-towns-label',
        type: 'symbol',
        source: 'settler-towns',
        layout: {
          'text-field': ['concat', 'est. ', ['to-string', ['get', 'foundedYear']]],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 8, 7, 10, 10, 12],
          'text-offset': [0, 1.0],
          'text-anchor': 'top',
          'text-optional': true,
          'text-font': ['DIN Pro Italic', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#94a3b8',
          'text-halo-color': 'rgba(0,0,0,0.92)',
          'text-halo-width': 1.5,
          'text-opacity': 0.85,
        },
      });

      // Forts — stockade icon symbol layer with a soft red glow underneath
      m.addSource('forts', { type: 'geojson', data: buildFortsGeoJSON() });
      loadFortIcon(m);
      m.addLayer({
        id: 'forts-glow',
        type: 'circle',
        source: 'forts',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 10, 7, 18, 10, 28],
          'circle-color': '#dc2626',
          'circle-opacity': 0.22,
          'circle-blur': 0.6,
        },
      });
      m.addLayer({
        id: 'forts-circle',
        type: 'circle',
        source: 'forts',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 4, 7, 7, 10, 10],
          'circle-color': 'rgba(15, 15, 20, 0.85)',
          'circle-stroke-color': '#dc2626',
          'circle-stroke-width': 1.5,
        },
      });
      m.addLayer({
        id: 'forts-icon',
        type: 'symbol',
        source: 'forts',
        layout: {
          'icon-image': 'fort-stockade',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.32, 7, 0.55, 10, 0.85],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
      m.addLayer({
        id: 'forts-label',
        type: 'symbol',
        source: 'forts',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 9, 8, 12, 10, 14],
          'text-offset': [0, 1.6],
          'text-anchor': 'top',
          'text-optional': true,
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#fef2f2',
          'text-halo-color': 'rgba(0,0,0,0.95)',
          'text-halo-width': 2,
        },
      });

      // Waypoints
      m.addSource('waypoints', { type: 'geojson', data: buildWaypointsGeoJSON() });
      m.addLayer({
        id: 'waypoints-circle',
        type: 'circle',
        source: 'waypoints',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 4, 7, 7],
          'circle-color': COLORS.waypointMarker,
          'circle-opacity': 0.9,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 1.5,
        },
      });

      // Routes
      m.addSource('routes', { type: 'geojson', data: buildRouteGeoJSON() });
      m.addLayer({
        id: 'routes-line',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 3, 7, 5],
          'line-opacity': 0.8,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
      m.addLayer({
        id: 'routes-glow',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 10,
          'line-opacity': 0.12,
          'line-blur': 6,
        },
      });

      // Historical trails — pre-removal Cherokee roads and trading paths.
      // Inserted BELOW town layers ('towns-glow') so town icons render on
      // top of the trail lines, not underneath them.
      m.addSource('historical-trails', { type: 'geojson', data: historicalTrails });
      m.addLayer({
        id: 'historical-trails-glow',
        type: 'line',
        source: 'historical-trails',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 6, 9, 14],
          'line-opacity': 0.15,
          'line-blur': 4,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      }, 'towns-glow');
      m.addLayer({
        id: 'historical-trails-line',
        type: 'line',
        source: 'historical-trails',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.5, 9, 3],
          'line-opacity': 0.85,
          'line-dasharray': [3, 2],
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      }, 'towns-glow');
      m.addLayer({
        id: 'historical-trails-label',
        type: 'symbol',
        source: 'historical-trails',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 9, 9, 12],
          'symbol-placement': 'line',
          'symbol-spacing': 500,
          'text-font': ['DIN Pro Italic', 'Arial Unicode MS Regular'],
          'text-letter-spacing': 0.05,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': 'rgba(0,0,0,0.85)',
          'text-halo-width': 2,
        },
      }, 'towns-glow');

      // Present-day Cherokee Nation territory
      m.addSource('present-cn', { type: 'geojson', data: presentCherokeeNation });
      m.addLayer({
        id: 'present-cn-fill',
        type: 'fill',
        source: 'present-cn',
        paint: {
          'fill-color': COLORS.presentCN,
          'fill-opacity': 0.35,
        },
      });
      m.addLayer({
        id: 'present-cn-line',
        type: 'line',
        source: 'present-cn',
        paint: {
          'line-color': COLORS.presentCN,
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });
      m.addLayer({
        id: 'present-cn-glow',
        type: 'line',
        source: 'present-cn',
        paint: {
          'line-color': COLORS.presentCN,
          'line-width': 8,
          'line-opacity': 0.15,
          'line-blur': 6,
        },
      });
      m.addLayer({
        id: 'present-cn-label',
        type: 'symbol',
        source: 'present-cn',
        layout: {
          'text-field': 'Cherokee Nation',
          'text-size': 13,
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#c7d2fe',
          'text-halo-color': 'rgba(0,0,0,0.85)',
          'text-halo-width': 2,
        },
      });

      // Present-day Qualla Boundary (EBCI)
      m.addSource('present-ebci', { type: 'geojson', data: presentQuallaBoundary });
      m.addLayer({
        id: 'present-ebci-fill',
        type: 'fill',
        source: 'present-ebci',
        paint: {
          'fill-color': COLORS.presentEBCI,
          'fill-opacity': 0.4,
        },
      });
      m.addLayer({
        id: 'present-ebci-line',
        type: 'line',
        source: 'present-ebci',
        paint: {
          'line-color': COLORS.presentEBCI,
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });
      m.addLayer({
        id: 'present-ebci-glow',
        type: 'line',
        source: 'present-ebci',
        paint: {
          'line-color': COLORS.presentEBCI,
          'line-width': 8,
          'line-opacity': 0.15,
          'line-blur': 6,
        },
      });
      m.addLayer({
        id: 'present-ebci-label',
        type: 'symbol',
        source: 'present-ebci',
        layout: {
          'text-field': 'Qualla Boundary\n(EBCI)',
          'text-size': 12,
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#bbf7d0',
          'text-halo-color': 'rgba(0,0,0,0.85)',
          'text-halo-width': 2,
        },
      });

      // =====================================================================
      // MODERN CHEROKEE LANDMARKS — sovereign nation facilities shown on
      // the Today scene: government HQs, hospitals, schools, cultural centers.
      // =====================================================================
      const MODERN_FC = {
        type: 'FeatureCollection',
        features: modernCherokee.map((p) => ({
          type: 'Feature',
          properties: {
            id: p.id,
            name: p.name,
            kind: p.kind,
            description: p.description,
            source: p.source,
          },
          geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
        })),
      };
      m.addSource('modern-cherokee', { type: 'geojson', data: MODERN_FC });

      // Bright Cherokee-blue glow
      m.addLayer({
        id: 'modern-cherokee-glow',
        type: 'circle',
        source: 'modern-cherokee',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 10, 7, 22, 10, 35],
          'circle-color': '#3b82f6',
          'circle-opacity': 0.25,
          'circle-blur': 0.5,
        },
      });

      // Solid dot — brighter than settler towns, signifying active sovereignty
      m.addLayer({
        id: 'modern-cherokee-circle',
        type: 'circle',
        source: 'modern-cherokee',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 5, 7, 8, 10, 12],
          'circle-color': '#1e3a5f',
          'circle-stroke-color': '#60a5fa',
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.95,
        },
      });

      // Label
      m.addLayer({
        id: 'modern-cherokee-label',
        type: 'symbol',
        source: 'modern-cherokee',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 9, 7, 12, 10, 15],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-optional': true,
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#93c5fd',
          'text-halo-color': 'rgba(0,0,0,0.92)',
          'text-halo-width': 2,
          'text-opacity': 0.95,
        },
      });

      // Click handlers
      const clickLayers = [
        'towns-icon', 'towns-plaza',
        'towns-lost-icon', 'towns-lost-plaza',
        'forts-icon', 'forts-circle',
        'waypoints-circle',
        'settler-towns-icon', 'settler-towns-circle',
        'modern-cherokee-circle',
      ];
      clickLayers.forEach((layerId) => {
        m.on('click', layerId, (e) => {
          const feature = e.features[0];
          const props = feature.properties;
          const coords = feature.geometry.coordinates.slice();

          if (popupRef.current) popupRef.current.remove();

          let html = '';
          if (layerId === 'towns-icon' || layerId === 'towns-plaza' || layerId === 'towns-lost-icon' || layerId === 'towns-lost-plaza') {
            const isLost = layerId.includes('lost');
            const lostBanner = isLost
              ? `<div style="background:#7f1d1d;color:#fecaca;padding:4px 8px;border-radius:4px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">Destroyed / Ceded</div>`
              : '';
            const syllabary = props.syllabary ? `<div style="font-size:20px;font-weight:700;color:${isLost ? '#f87171' : '#fbbf24'};line-height:1">${props.syllabary}</div>` : '';
            const cherokee = props.cherokeeName
              ? `<div style="font-size:12px;color:${isLost ? '#fca5a5' : '#fde68a'};margin-bottom:2px;font-style:italic">${props.cherokeeName}</div>`
              : '';
            const capitalBadge = props.isCapital === true || props.isCapital === 'true'
              ? `<span style="display:inline-block;background:${isLost ? '#991b1b' : '#fbbf24'};color:${isLost ? '#fecaca' : '#0a0f1a'};padding:2px 6px;border-radius:10px;font-size:9px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;margin-left:6px;vertical-align:middle">${isLost ? 'Former Capital' : 'Capital'}</span>`
              : '';
            const divisionLabel = props.division
              ? `<div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">${props.division} Town</div>`
              : '';
            html = `
              <div style="max-width:320px;padding:4px">
                ${lostBanner}
                ${syllabary}
                ${cherokee}
                <h3 style="margin:6px 0 2px;font-size:16px;color:${isLost ? '#fecaca' : '#f9fafb'};font-family:Georgia,serif">${props.name}${capitalBadge}</h3>
                ${divisionLabel}
                <div style="font-size:13px;line-height:1.55;color:#d1d5db;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">${props.significance}</div>
                ${props.status ? `<div style="font-size:11px;color:#94a3b8;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);font-style:italic">Today: ${props.status}</div>` : ''}
              </div>
            `;
          } else if (layerId === 'forts-icon' || layerId === 'forts-circle') {
            html = `
              <div style="max-width:320px;padding:4px">
                <div style="font-size:9px;color:#f87171;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">U.S. Collection Fort</div>
                <h3 style="margin:0 0 4px;font-size:16px;color:#fef2f2;font-family:Georgia,serif">${props.name}</h3>
                <div style="font-size:11px;color:#fecaca;margin-bottom:8px">${props.location}</div>
                <div style="font-size:13px;line-height:1.55;color:#d1d5db;padding-top:8px;border-top:1px solid rgba(248,113,113,0.2)">${props.notes}</div>
              </div>
            `;
          } else if (layerId === 'modern-cherokee-circle') {
            const kindLabels = {
              government: 'Sovereign Government',
              media: 'Cherokee Media',
              education: 'Language Revitalization',
              health: 'Tribal Health',
              cultural: 'Cultural Preservation',
            };
            const eyebrow = kindLabels[props.kind] || 'Modern Cherokee';
            html = `
              <div style="max-width:340px;padding:4px">
                <div style="font-size:9px;color:#60a5fa;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;font-weight:700">${eyebrow}</div>
                <h3 style="margin:0 0 6px;font-size:17px;color:#f9fafb;font-family:Georgia,serif;line-height:1.2">${props.name}</h3>
                <div style="font-size:13px;line-height:1.55;color:#e5e7eb">${props.description}</div>
                ${props.source ? `<div style="font-size:9px;color:#64748b;margin-top:10px;padding-top:8px;border-top:1px solid rgba(96,165,250,0.2);line-height:1.4">Source: ${props.source}</div>` : ''}
              </div>
            `;
          } else if (layerId === 'settler-towns-icon' || layerId === 'settler-towns-circle') {
            // Parse the JSON-encoded events array back into a list
            let events = [];
            try {
              events = JSON.parse(props.nativeEvents || '[]');
            } catch (err) {
              events = [];
            }
            const eyebrowLabel = props.kind === 'fort' ? 'Colonial / U.S. Fort' : 'Settler Town';
            const founding = props.founding
              ? `<div style="font-size:13px;line-height:1.55;color:#e5e7eb;margin-bottom:12px">${props.founding}</div>`
              : '';
            const eventsHtml = events.length
              ? `
                <div style="padding-top:10px;border-top:1px solid rgba(203,213,225,0.18);margin-top:4px">
                  <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;font-weight:700">Connections to Native Peoples</div>
                  ${events.map((ev) => `
                    <div style="margin-bottom:10px">
                      <div style="font-size:10px;color:#cbd5e1;font-family:'Courier New',monospace;letter-spacing:0.04em;margin-bottom:2px">${ev.year}</div>
                      <div style="font-size:12px;line-height:1.55;color:#e5e7eb">${ev.event}</div>
                    </div>
                  `).join('')}
                </div>
              `
              : '';
            const todayLine = props.today
              ? `<div style="font-size:11px;color:#94a3b8;margin-top:10px;padding-top:8px;border-top:1px solid rgba(203,213,225,0.18);font-style:italic">Today: ${props.today}</div>`
              : '';
            const sourceLine = props.source
              ? `<div style="font-size:9px;color:#64748b;margin-top:8px;line-height:1.4">Source: ${props.source}</div>`
              : '';
            html = `
              <div style="max-width:380px;padding:4px">
                <div style="font-size:9px;color:#cbd5e1;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">${eyebrowLabel}</div>
                <h3 style="margin:0 0 2px;font-size:17px;color:#f9fafb;font-family:Georgia,serif;line-height:1.2">${props.name}<span style="font-size:11px;color:#94a3b8;font-family:'Courier New',monospace;font-weight:400;margin-left:8px">est. ${props.foundedYear}</span></h3>
                <div style="font-size:11px;color:#94a3b8;margin-bottom:10px;font-style:italic">${props.state}</div>
                ${founding}
                ${eventsHtml}
                ${todayLine}
                ${sourceLine}
              </div>
            `;
          } else {
            html = `
              <div style="max-width:320px;padding:4px">
                <div style="font-size:9px;color:#fbbf24;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Trail Waypoint</div>
                <h3 style="margin:0 0 4px;font-size:16px;color:#fef3c7;font-family:Georgia,serif">${props.name}</h3>
                <div style="font-size:11px;color:#fde68a;margin-bottom:8px">${props.location}</div>
                <div style="font-size:13px;line-height:1.55;color:#d1d5db;padding-top:8px;border-top:1px solid rgba(251,191,36,0.2)">${props.significance}</div>
              </div>
            `;
          }

          popupRef.current = new mapboxgl.Popup({
            closeButton: true,
            maxWidth: '320px',
            className: 'custom-popup',
          })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(m);
        });

        m.on('mouseenter', layerId, () => {
          m.getCanvas().style.cursor = 'pointer';
        });
        m.on('mouseleave', layerId, () => {
          m.getCanvas().style.cursor = '';
        });
      });

      // Click handler for historical trails — show rich context popup
      m.on('click', 'historical-trails-line', (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const props = feature.properties;
        if (popupRef.current) popupRef.current.remove();

        const trailColor = props.color || '#c084fc';
        const cherokeeLine = props.nameCherokee && props.nameCherokee !== 'null'
          ? `<div style="font-size:11px;color:#cbd5e1;margin-bottom:2px;font-style:italic">${props.nameCherokee}</div>`
          : '';
        const periodLine = props.period
          ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:8px">${props.period}${props.length ? ` · ${props.length}` : ''}</div>`
          : '';
        const summary = props.summary
          ? `<div style="font-size:13px;line-height:1.55;color:#e5e7eb;margin-bottom:12px">${props.summary}</div>`
          : '';
        const history = props.history
          ? `<div style="font-size:12px;line-height:1.55;color:#d1d5db;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);margin-top:4px"><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">History</div>${props.history}</div>`
          : '';
        const modern = props.modernEquivalent
          ? `<div style="font-size:12px;line-height:1.55;color:#d1d5db;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);margin-top:10px"><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Today</div>${props.modernEquivalent}</div>`
          : '';

        const html = `
          <div style="max-width:360px;padding:6px 4px 4px">
            <div style="font-size:9px;color:${trailColor};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;font-weight:700">Historical Trail</div>
            <h3 style="margin:0 0 2px;font-size:17px;color:#f9fafb;font-family:Georgia,serif;line-height:1.2">${props.name}</h3>
            ${cherokeeLine}
            ${periodLine}
            ${summary}
            ${history}
            ${modern}
          </div>
        `;

        popupRef.current = new mapboxgl.Popup({
          closeButton: true,
          maxWidth: '400px',
          className: 'custom-popup',
        })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(m);
      });

      m.on('mouseenter', 'historical-trails-line', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'historical-trails-line', () => {
        m.getCanvas().style.cursor = '';
      });

      // Set initial padding so the map knows the scene panel covers the right edge
      m.setPadding({ top: 40, right: 470, bottom: 40, left: 40 });

      // Set initial layer visibility + camera based on the currently active scene
      const initialScene = SCENES[sceneIndexRef.current] || SCENES[0];
      if (initialScene) {
        updateSceneLayerVisibility(m, initialScene.layers || []);
        if (initialScene.map) {
          m.jumpTo({
            center: initialScene.map.center,
            zoom: initialScene.map.zoom,
            bearing: initialScene.map.bearing || 0,
            pitch: initialScene.map.pitch || 0,
          });
        }
        // Apply initial territory + dots + towns/lost-towns
        if (initialScene.territoryKey) {
          const territorySource = m.getSource('territory-current');
          const geojson = TERRITORY_MAP[initialScene.territoryKey];
          if (territorySource && geojson) territorySource.setData(geojson);

          const dotSource = m.getSource('population-dots');
          if (dotSource && POPULATION_DOTS[initialScene.territoryKey]) {
            dotSource.setData(computeDotsForScene(initialScene.territoryKey, initialScene.effectiveYear));
          }

          const townsSourceInit = m.getSource('towns');
          const townsLostSourceInit = m.getSource('towns-lost');
          if (townsSourceInit && townsLostSourceInit) {
            const { living, lost } = computeTownsForScene(initialScene.territoryKey, initialScene.effectiveYear);
            townsSourceInit.setData(living);
            townsLostSourceInit.setData(lost);
          }
        }
        // Initial settler towns — show those that existed by this scene's year
        const settlerSourceInit = m.getSource('settler-towns');
        if (settlerSourceInit) {
          settlerSourceInit.setData(settlerTownsForYear(initialScene.effectiveYear));
        }
      }

      // Ensure the map paints its first frame after load. Without this,
      // the WebGL canvas sometimes stays blank until the user interacts.
      requestAnimationFrame(() => m.resize());
      setTimeout(() => m.resize(), 250);
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
      mapReady.current = false;
    };
  }, []);

  // Scene-driven updates: everything (camera, layers, data) flows from currentSceneIndex
  useEffect(() => {
    if (!mapReady.current || !map.current) return;

    const scene = SCENES[state.currentSceneIndex];
    if (!scene) return;

    const m = map.current;
    const territorySource = m.getSource('territory-current');
    const dotSource = m.getSource('population-dots');
    const townsSource = m.getSource('towns');
    const townsLostSource = m.getSource('towns-lost');
    const settlerSource = m.getSource('settler-towns');

    // 1. Apply layer visibility from scene.layers
    updateSceneLayerVisibility(m, scene.layers || []);

    // 1b. Apply year-based filter to time-aware layers (colonial claims etc.)
    // Features have validFrom/validTo properties; show only those where
    // validFrom <= effectiveYear <= validTo.
    const year = scene.effectiveYear || 1700;
    const yearFilter = [
      'all',
      ['<=', ['get', 'validFrom'], year],
      ['>=', ['get', 'validTo'], year],
    ];
    // Combine with the existing geometry-type filter for polygon layers
    const polygonYearFilter = ['all', ['==', ['geometry-type'], 'Polygon'], ...yearFilter.slice(1).map(f => f)];
    const lineYearFilter = ['all', ['==', ['geometry-type'], 'LineString'], ...yearFilter.slice(1).map(f => f)];
    try {
      if (m.getLayer('colonial-claims-fill')) m.setFilter('colonial-claims-fill', polygonYearFilter);
      if (m.getLayer('colonial-claims-line')) m.setFilter('colonial-claims-line', polygonYearFilter);
      if (m.getLayer('colonial-claims-label')) m.setFilter('colonial-claims-label', polygonYearFilter);
      if (m.getLayer('colonial-line-glow')) m.setFilter('colonial-line-glow', lineYearFilter);
      if (m.getLayer('colonial-line-main')) m.setFilter('colonial-line-main', lineYearFilter);
      if (m.getLayer('colonial-line-label')) m.setFilter('colonial-line-label', lineYearFilter);
    } catch (e) {
      // Layer may not be added yet during initial load; ignore.
    }

    // 2. Update territory polygon
    if (scene.territoryKey && territorySource) {
      const geojson = TERRITORY_MAP[scene.territoryKey];
      if (geojson) territorySource.setData(geojson);
    }

    // 3. Update population dots
    if (dotSource) {
      if (scene.id === 'smallpox') {
        // Special case: 1738 epidemic — show precontact population with
        // half the dots marked `dying` (rendered red)
        dotSource.setData(SMALLPOX_DOTS);
      } else if (scene.id === 'chickamauga-war') {
        // Special case: ~15,000 dots in the main Cherokee Nation +
        // ~1,000 refugee dots clustered at the Five Lower Towns
        dotSource.setData(CHICKAMAUGA_DOTS);
      } else if (scene.migrationFrame !== undefined) {
        // Removal scene: show migration dots
        const frame = MIGRATION_FRAMES[scene.migrationFrame];
        dotSource.setData(frame || EMPTY_FC);
      } else if (scene.territoryKey && POPULATION_DOTS[scene.territoryKey]) {
        // Treaty/homeland scene: show territory-based dots, filtered by year
        dotSource.setData(computeDotsForScene(scene.territoryKey, scene.effectiveYear));
      } else {
        // Scene has no population representation
        dotSource.setData(EMPTY_FC);
      }
    }

    // 4. Update town sources — one unified function handles all lifecycle cases:
    // territory cession, destruction dates, founding dates, and the Chickamauga
    // special case. Living towns get gold icons; lost towns get dark/burnt icons.
    if (scene.territoryKey) {
      const { living, lost } = computeTownsForScene(scene.territoryKey, scene.effectiveYear);
      if (townsSource) townsSource.setData(living);
      if (townsLostSource) townsLostSource.setData(lost);
    } else if (scene.chapter === 'Removal' || scene.chapter === 'Today') {
      // Removal and Today scenes: show ALL Cherokee towns as destroyed/lost.
      // The towns didn't vanish — they were emptied. The user should see every
      // dark burnt icon across the ghost territory to understand what was taken.
      const year = scene.effectiveYear || 1838;
      const allTowns = [
        ...NON_CHICKAMAUGA_TOWNS,
        ...CHICKAMAUGA_TOWNS,
        ...YEAR_GATED_TOWNS,
        ...ALWAYS_SHOW_TOWNS,
      ].filter((t) => !t.foundedYear || t.foundedYear <= year);
      if (townsSource) townsSource.setData(buildTownsGeoJSON([]));
      if (townsLostSource) townsLostSource.setData(buildTownsGeoJSON(allTowns));
    } else {
      // Other scenes without a territoryKey: hide both sets
      if (townsSource) townsSource.setData(buildTownsGeoJSON([]));
      if (townsLostSource) townsLostSource.setData(buildTownsGeoJSON([]));
    }

    // 4b. Settler towns — refresh per scene year so settlements appear as the
    // timeline advances. Visibility itself is still controlled by LAYER_GROUPS.
    if (settlerSource) {
      settlerSource.setData(settlerTownsForYear(scene.effectiveYear));
    }

    // 4. Fly camera to scene's map state with cinematic timing.
    // Use padding to tell Mapbox the right 470px is covered by the scene panel,
    // so the scene's center coordinates will be centered in the *visible* area
    // (not the full viewport).
    if (scene.map) {
      m.flyTo({
        center: scene.map.center,
        zoom: scene.map.zoom,
        bearing: scene.map.bearing || 0,
        pitch: scene.map.pitch || 0,
        padding: { top: 40, right: 470, bottom: 40, left: 40 },
        duration: 1800,
        curve: 1.3,
        essential: true,
      });
    }
  }, [state.currentSceneIndex]);

  return <div className="map-container" ref={mapContainer} />;
}

// Map from logical layer group names (used in scene definitions) to actual Mapbox layer IDs
const LAYER_GROUPS = {
  'territory-current': ['territory-current-fill', 'territory-current-line', 'territory-current-glow'],
  'territory-ghost': ['territory-ghost-fill', 'territory-ghost-line'],
  'towns': [
    'towns-glow', 'towns-plaza', 'towns-icon', 'towns-label', 'towns-label-english',
    'towns-lost-glow', 'towns-lost-plaza', 'towns-lost-icon', 'towns-lost-label',
  ],
  'forts': ['forts-glow', 'forts-circle', 'forts-icon', 'forts-label'],
  'settler-towns': [
    'settler-towns-glow', 'settler-towns-circle', 'settler-towns-icon', 'settler-towns-label',
  ],
  'waypoints': ['waypoints-circle'],
  'routes': ['routes-line', 'routes-glow'],
  'historical-trails': ['historical-trails-glow', 'historical-trails-line', 'historical-trails-label'],
  'cherokee-rivers': ['cherokee-rivers-label'],
  'colonial-claims': ['colonial-claims-fill', 'colonial-claims-line', 'colonial-claims-label'],
  'proclamation-line': ['colonial-line-glow', 'colonial-line-main', 'colonial-line-label'],
  'battle-sites': [
    'battle-enemy-zone', 'battle-enemy-zone-line', 'battle-arrow-glow', 'battle-arrow-line',
    'battle-force-label', 'battle-marker-glow', 'battle-marker-circle', 'battle-marker-label',
  ],
  'population-dots': ['population-dots-glow', 'population-dots-circle'],
  'present-day': [
    'present-cn-fill', 'present-cn-line', 'present-cn-glow', 'present-cn-label',
    'present-ebci-fill', 'present-ebci-line', 'present-ebci-glow', 'present-ebci-label',
  ],
  'modern-cherokee': [
    'modern-cherokee-glow', 'modern-cherokee-circle', 'modern-cherokee-label',
  ],
};

const ALL_LAYER_IDS = Object.values(LAYER_GROUPS).flat();

function updateSceneLayerVisibility(m, enabledGroups) {
  const enabledIds = new Set(
    enabledGroups.flatMap((group) => LAYER_GROUPS[group] || [])
  );
  for (const id of ALL_LAYER_IDS) {
    if (m.getLayer(id)) {
      m.setLayoutProperty(id, 'visibility', enabledIds.has(id) ? 'visible' : 'none');
    }
  }
}
