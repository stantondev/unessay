/**
 * Generate population dots scattered within a GeoJSON polygon.
 * Each dot represents `peoplePerDot` people.
 * Uses rejection sampling: random points in bounding box, keep those inside polygon.
 */

// Seeded pseudo-random for reproducible dot placement
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// Ray-casting point-in-polygon test
function pointInPolygon(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Get bounding box of a polygon ring
function getBBox(ring) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLng, minLat, maxLng, maxLat };
}

/**
 * Generate dots within a GeoJSON FeatureCollection containing Polygon(s).
 * @param {Object} geojson - GeoJSON FeatureCollection with Polygon features
 * @param {number} population - Total population to represent
 * @param {number} peoplePerDot - How many people each dot represents
 * @param {number} seed - Random seed for reproducibility
 * @returns {Object} GeoJSON FeatureCollection of Point features
 */
export function generatePopulationDots(geojson, population, peoplePerDot = 100, seed = 42) {
  const numDots = Math.round(population / peoplePerDot);
  const features = geojson.features || [];
  if (features.length === 0 || numDots === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  // Collect all polygon rings (handle both Polygon and MultiPolygon)
  const rings = [];
  for (const feature of features) {
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      rings.push(geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        rings.push(poly[0]);
      }
    }
  }

  if (rings.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  // Get combined bounding box
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const ring of rings) {
    const bbox = getBBox(ring);
    if (bbox.minLng < minLng) minLng = bbox.minLng;
    if (bbox.minLat < minLat) minLat = bbox.minLat;
    if (bbox.maxLng > maxLng) maxLng = bbox.maxLng;
    if (bbox.maxLat > maxLat) maxLat = bbox.maxLat;
  }

  const rand = seededRandom(seed);
  const points = [];
  let attempts = 0;
  const maxAttempts = numDots * 20; // Safety valve

  while (points.length < numDots && attempts < maxAttempts) {
    attempts++;
    const lng = minLng + rand() * (maxLng - minLng);
    const lat = minLat + rand() * (maxLat - minLat);

    // Check if point is inside any ring
    for (const ring of rings) {
      if (pointInPolygon(lng, lat, ring)) {
        points.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [Math.round(lng * 1000) / 1000, Math.round(lat * 1000) / 1000],
          },
        });
        break;
      }
    }
  }

  return { type: 'FeatureCollection', features: points };
}

/**
 * Pre-generate dots for all territory stages so we don't recompute on slider move.
 * Returns a Map of territoryKey -> GeoJSON FeatureCollection of dots.
 */
export function preGenerateAllDots(territoryMap, populationData, peoplePerDot = 100) {
  const result = {};
  for (const [key, geojson] of Object.entries(territoryMap)) {
    const stageData = populationData[key];
    if (!stageData || !geojson) continue;
    result[key] = generatePopulationDots(geojson, stageData.population, peoplePerDot, 42 + key.length);
  }
  return result;
}

// Box-Muller transform for a gaussian-like random offset (0 mean)
function gaussianRandom(rand) {
  const u1 = Math.max(rand(), 1e-12);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Filter a list of point features (with .lat and .lon) to only those
 * that fall inside the given GeoJSON FeatureCollection of Polygon/MultiPolygon.
 *
 * Used to drop Cherokee town markers from ceded territory — after a treaty
 * stripped an area out of Cherokee country, the towns there were no longer
 * part of the Cherokee Nation politically, so they shouldn't render on the map.
 */
export function filterTownsInPolygon(towns, geojson) {
  const rings = [];
  for (const feature of geojson.features || []) {
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      rings.push(geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        rings.push(poly[0]);
      }
    }
  }
  if (rings.length === 0) return [];
  return towns.filter((t) => {
    for (const ring of rings) {
      if (pointInPolygon(t.lon, t.lat, ring)) return true;
    }
    return false;
  });
}

/**
 * Generate population dots CLUSTERED around real Cherokee town locations.
 * This is historically accurate: Cherokee people lived in concentrated towns
 * along rivers, not scattered across the landscape.
 *
 * Towns outside the current territory are excluded (their population is
 * redistributed across surviving towns — each surviving town gets denser).
 *
 * @param {Object} territoryGeojson - GeoJSON FeatureCollection with Polygon features
 * @param {Array} towns - Array of town objects with { lat, lon, isCapital }
 * @param {number} population - Total population to represent
 * @param {number} peoplePerDot - People per dot
 * @param {number} seed - Random seed
 * @returns {Object} GeoJSON FeatureCollection of Point features
 */
export function generateTownClusteredDots(territoryGeojson, towns, population, peoplePerDot = 100, seed = 42) {
  const totalDots = Math.round(population / peoplePerDot);
  if (totalDots === 0 || !towns?.length) {
    return { type: 'FeatureCollection', features: [] };
  }

  // Collect all polygon rings
  const rings = [];
  for (const feature of territoryGeojson.features || []) {
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      rings.push(geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        rings.push(poly[0]);
      }
    }
  }
  if (rings.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  // Filter towns: keep only those inside the current territory
  const insideTowns = towns.filter((t) => {
    for (const ring of rings) {
      if (pointInPolygon(t.lon, t.lat, ring)) return true;
    }
    return false;
  });

  if (insideTowns.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  // Weight capitals slightly higher (larger population centers)
  const weights = insideTowns.map((t) => (t.isCapital ? 1.8 : 1.0));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Distribute dots across surviving towns, weighted by capital status
  const dotsPerTown = insideTowns.map((_, i) =>
    Math.max(1, Math.round((weights[i] / totalWeight) * totalDots))
  );

  const rand = seededRandom(seed);
  const features = [];

  for (let i = 0; i < insideTowns.length; i++) {
    const town = insideTowns[i];
    const nDots = dotsPerTown[i];
    // Cluster radius — capitals have slightly wider spread (bigger populations = more spread)
    const sigmaLng = town.isCapital ? 0.07 : 0.045;
    const sigmaLat = town.isCapital ? 0.05 : 0.035;

    for (let d = 0; d < nDots; d++) {
      // Gaussian offset around town center
      const dx = gaussianRandom(rand) * sigmaLng;
      const dy = gaussianRandom(rand) * sigmaLat;
      let lng = town.lon + dx;
      let lat = town.lat + dy;

      // Keep dots inside the territory polygon
      let inside = false;
      for (const ring of rings) {
        if (pointInPolygon(lng, lat, ring)) { inside = true; break; }
      }
      // If it fell outside, snap closer to the town center
      if (!inside) {
        lng = town.lon + dx * 0.3;
        lat = town.lat + dy * 0.3;
      }

      features.push({
        type: 'Feature',
        properties: { townId: town.id || null },
        geometry: {
          type: 'Point',
          coordinates: [Math.round(lng * 1000) / 1000, Math.round(lat * 1000) / 1000],
        },
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

/**
 * Interpolate a position along a LineString at a given progress (0-1).
 */
function interpolateAlongRoute(coords, progress) {
  if (coords.length < 2) return coords[0];
  if (progress <= 0) return coords[0];
  if (progress >= 1) return coords[coords.length - 1];

  // Calculate total length and find segment
  const segments = [];
  let totalLen = 0;
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push(len);
    totalLen += len;
  }

  const targetDist = progress * totalLen;
  let accum = 0;
  for (let i = 0; i < segments.length; i++) {
    if (accum + segments[i] >= targetDist) {
      const t = (targetDist - accum) / segments[i];
      return [
        coords[i][0] + t * (coords[i + 1][0] - coords[i][0]),
        coords[i][1] + t * (coords[i + 1][1] - coords[i][1]),
      ];
    }
    accum += segments[i];
  }
  return coords[coords.length - 1];
}

/**
 * Generate 6 migration frames showing dots moving along Trail of Tears routes.
 *
 * @param {Object} routeWaypoints - { routeKey: [[lng,lat], ...], ... }
 * @param {Array} forts - [{lon, lat}, ...] fort positions
 * @param {number} totalDots - Total dots to animate (e.g., 80)
 * @param {number} deathCount - Dots that die during journey (e.g., 20)
 * @returns {Array} 6 GeoJSON FeatureCollections, one per removal frame
 */
export function generateMigrationFrames(routeWaypoints, forts, totalDots = 80, deathCount = 20) {
  const rand = seededRandom(777);

  // Distribute dots across routes (proportional to historical detachments)
  const routeAlloc = {
    'northern-overland': Math.round(totalDots * 0.58),
    'water': Math.round(totalDots * 0.15),
    'benge': Math.round(totalDots * 0.13),
    'bell': Math.round(totalDots * 0.14),
  };

  // Adjust to match totalDots exactly
  const allocTotal = Object.values(routeAlloc).reduce((a, b) => a + b, 0);
  routeAlloc['northern-overland'] += totalDots - allocTotal;

  // Create dot assignments: each dot gets a route and a random scatter offset
  const dots = [];
  for (const [routeKey, count] of Object.entries(routeAlloc)) {
    const coords = routeWaypoints[routeKey];
    if (!coords) continue;
    for (let i = 0; i < count; i++) {
      dots.push({
        route: routeKey,
        coords: coords,
        scatterLng: (rand() - 0.5) * 0.6, // ±0.3 degrees scatter
        scatterLat: (rand() - 0.5) * 0.4, // ±0.2 degrees scatter
        progressOffset: (rand() - 0.5) * 0.12, // slight progress variation
      });
    }
  }

  // Mark dots for death (randomly selected, die at specific frames).
  // Deaths happen across frames 2-5 with peaks at frames 3-4 (the worst winter).
  // Frame distribution roughly matches the historical death curve:
  //   Frame 2 (Crossing Tennessee, ~800 lost) — small wave
  //   Frame 3 (Frozen Rivers, ~2200 cumulative) — biggest wave
  //   Frame 4 (Crossing Arkansas, ~3500 cumulative) — second wave
  //   Frame 5 (Arrival, ~4000 cumulative) — final wave
  const deathIndices = new Set();
  while (deathIndices.size < deathCount && deathIndices.size < dots.length) {
    deathIndices.add(Math.floor(rand() * dots.length));
  }
  const deathFrameMap = {}; // dotIndex -> frame where they die (0-5)
  let deathIdx = 0;
  for (const di of deathIndices) {
    // Deaths distributed across frames 2-5, weighted toward frames 3-4 (worst winter)
    let frame;
    const ratio = deathIdx / deathCount;
    if (ratio < 0.2) frame = 2;       // ~20% of deaths in frame 2 (Crossing Tennessee)
    else if (ratio < 0.55) frame = 3; // ~35% in frame 3 (Frozen Rivers — peak)
    else if (ratio < 0.85) frame = 4; // ~30% in frame 4 (Crossing Arkansas)
    else frame = 5;                   // ~15% in frame 5 (Arrival)
    deathFrameMap[di] = frame;
    deathIdx++;
  }

  // Frame definitions: [progress along route, label]
  const frameProgresses = [0.0, 0.0, 0.3, 0.55, 0.8, 1.0];

  // Generate 6 frames
  const frames = [];
  for (let f = 0; f < 6; f++) {
    const progress = frameProgresses[f];
    const features = [];

    for (let d = 0; d < dots.length; d++) {
      const dot = dots[d];
      const deathFrame = deathFrameMap[d];

      // Skip dots that died in earlier frames
      if (deathFrame !== undefined && f > deathFrame) continue;

      // Is this dot dying this frame?
      const isDying = deathFrame === f;

      let lng, lat;

      if (f === 0) {
        // Frame 0: Roundup — cluster at fort positions
        const fortIdx = Math.floor(rand() * forts.length) % forts.length;
        // Use a deterministic fort assignment per dot
        const assignedFort = forts[d % forts.length];
        lng = assignedFort.lon + (rand() - 0.5) * 0.3;
        lat = assignedFort.lat + (rand() - 0.5) * 0.2;
      } else {
        // Frames 1-5: interpolate along route
        const dotProgress = Math.max(0, Math.min(1, progress + dot.progressOffset));
        const pos = interpolateAlongRoute(dot.coords, dotProgress);
        // Scatter decreases as progress increases (people bunch up toward the end)
        const scatterFade = 1 - progress * 0.5;
        lng = pos[0] + dot.scatterLng * scatterFade;
        lat = pos[1] + dot.scatterLat * scatterFade;
      }

      features.push({
        type: 'Feature',
        properties: {
          dying: isDying,
          route: dot.route,
        },
        geometry: {
          type: 'Point',
          coordinates: [Math.round(lng * 1000) / 1000, Math.round(lat * 1000) / 1000],
        },
      });
    }

    frames.push({ type: 'FeatureCollection', features });
  }

  return frames;
}
