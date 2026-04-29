// ============================================================================
// MEMORIAL DOTS
//
// One dot for each documented death on the Trail of Tears. Rendered only on
// the "arrival" scene after the user has walked the journey with the
// detachments. 2,000–4,000 died between the camps, the march, and the first
// year after arrival; we place ~2,200 dots so the signature "lostSoFar: 2,200"
// marker on the arrival scene has a one-dot-to-one-death correspondence.
//
// Placement is not random. Dots cluster at documented sites of mass death:
// the Fort Cass internment camps (where the largest die-off happened before
// the march even started), the Mississippi ice crossing (where Bushyhead's
// detachment was trapped a month), Hopkinsville (White Path's grave), Little
// Rock (Quatie Ross's death aboard the steamboat Victoria), and the Tahlequah
// arrival site. The remainder scatters along the actual route paths with
// small perpendicular jitter, because people died all along the way.
//
// Each dot also carries a `order` (0..1) so the layer can reveal them one by
// one — silent accumulation — rather than appearing as a cloud.
// ============================================================================

// Known cluster sites: each is center [lon, lat], radius in degrees, count of dots.
const DEATH_CLUSTERS = [
  {
    id: 'fort-cass-camps',
    center: [-84.86, 35.29],
    radius: 0.18,
    count: 900,
    label: 'Fort Cass camps — May to September 1838',
  },
  {
    id: 'red-clay-camps',
    center: [-84.96, 35.10],
    radius: 0.08,
    count: 120,
    label: 'Red Clay Council Ground camps',
  },
  {
    id: 'rosss-landing-camps',
    center: [-85.31, 35.05],
    radius: 0.09,
    count: 140,
    label: 'Ross\u2019s Landing camps',
  },
  {
    id: 'hopkinsville',
    center: [-87.49, 36.87],
    radius: 0.12,
    count: 160,
    label: 'Hopkinsville, KY — where White Path died',
  },
  {
    id: 'mantle-rock',
    center: [-88.37, 37.15],
    radius: 0.08,
    count: 80,
    label: 'Mantle Rock — Hildebrand detachment two-week camp',
  },
  {
    id: 'ohio-river-crossing',
    center: [-88.49, 37.37],
    radius: 0.06,
    count: 60,
    label: 'Ohio River crossing at Golconda',
  },
  {
    id: 'mississippi-crossing',
    center: [-89.46, 37.45],
    radius: 0.10,
    count: 150,
    label: 'Mississippi River ice crossing (Trail of Tears State Park)',
  },
  {
    id: 'steamboat-victoria',
    center: [-92.29, 34.74],
    radius: 0.10,
    count: 120,
    label: 'Little Rock, AR \u2014 Quatie Ross, steamboat Victoria, Feb. 1, 1839',
  },
  {
    id: 'tahlequah-arrival',
    center: [-94.97, 35.92],
    radius: 0.12,
    count: 90,
    label: 'Arrival at Tahlequah',
  },
];

// Scattered route dots: dropped along these route IDs with small jitter.
const ROUTE_SCATTER = [
  { routeId: 'northern-overland', count: 220 },
  { routeId: 'benge', count: 120 },
  { routeId: 'bell', count: 60 },
  { routeId: 'water', count: 80 },
];

// Deterministic pseudo-random — same layout every render.
// Uses a simple LCG seeded by index.
function seeded(n) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function randInCircle(cx, cy, radius, seed) {
  const r = radius * Math.sqrt(seeded(seed));
  const theta = seeded(seed + 0.1) * Math.PI * 2;
  return [cx + Math.cos(theta) * r, cy + Math.sin(theta) * r];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function jitterAlongRoute(routeCoords, i, total, maxOffset = 0.05) {
  // Walk along the polyline, sample position at fraction of total length.
  // Compute cumulative lengths in degrees (rough, but fine for scatter).
  const segLens = [];
  let totalLen = 0;
  for (let s = 0; s < routeCoords.length - 1; s++) {
    const dx = routeCoords[s + 1][0] - routeCoords[s][0];
    const dy = routeCoords[s + 1][1] - routeCoords[s][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segLens.push(len);
    totalLen += len;
  }
  const target = (i / total) * totalLen;
  let walked = 0;
  for (let s = 0; s < segLens.length; s++) {
    if (walked + segLens[s] >= target) {
      const t = (target - walked) / segLens[s];
      const a = routeCoords[s];
      const b = routeCoords[s + 1];
      const lon = lerp(a[0], b[0], t);
      const lat = lerp(a[1], b[1], t);
      // Perpendicular direction for jitter
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const perpX = -dy;
      const perpY = dx;
      const norm = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
      const off = (seeded(i * 37) - 0.5) * 2 * maxOffset;
      return [lon + (perpX / norm) * off, lat + (perpY / norm) * off];
    }
    walked += segLens[s];
  }
  return routeCoords[routeCoords.length - 1];
}

/**
 * Build the memorial-dots GeoJSON FeatureCollection.
 * @param {Object} routeWaypoints - routeId -> [[lon, lat], ...] linestring
 */
export function buildMemorialDotsGeoJSON(routeWaypoints) {
  const features = [];
  let globalIdx = 0;

  // Cluster dots
  let clusterOffset = 0;
  for (const cluster of DEATH_CLUSTERS) {
    for (let i = 0; i < cluster.count; i++) {
      const seed = clusterOffset + i;
      const [lon, lat] = randInCircle(cluster.center[0], cluster.center[1], cluster.radius, seed + 1);
      features.push({
        type: 'Feature',
        properties: {
          cluster: cluster.id,
          label: cluster.label,
          order: globalIdx,
        },
        geometry: { type: 'Point', coordinates: [lon, lat] },
      });
      globalIdx++;
    }
    clusterOffset += cluster.count + 1000;
  }

  // Scattered route dots
  for (const { routeId, count } of ROUTE_SCATTER) {
    const coords = routeWaypoints[routeId];
    if (!coords || coords.length < 2) continue;
    for (let i = 0; i < count; i++) {
      const [lon, lat] = jitterAlongRoute(coords, i, count, 0.08);
      features.push({
        type: 'Feature',
        properties: {
          cluster: `route-${routeId}`,
          label: `Died along the ${routeId.replace('-', ' ')} route`,
          order: globalIdx,
        },
        geometry: { type: 'Point', coordinates: [lon, lat] },
      });
      globalIdx++;
    }
  }

  // Shuffle the `order` so the reveal isn't spatially ordered by cluster —
  // it should feel like deaths accumulate everywhere simultaneously, not as
  // a wave crossing the country.
  const total = features.length;
  const orderShuffle = Array.from({ length: total }, (_, i) => i);
  // Fisher-Yates with seeded randomness
  for (let i = orderShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(i * 13 + 7) * (i + 1));
    [orderShuffle[i], orderShuffle[j]] = [orderShuffle[j], orderShuffle[i]];
  }
  features.forEach((f, i) => {
    f.properties.order = orderShuffle[i];
    f.properties.orderFrac = orderShuffle[i] / Math.max(1, total - 1);
  });

  return {
    type: 'FeatureCollection',
    features,
    _totalDots: total,
  };
}

export const MEMORIAL_DEATH_CLUSTERS = DEATH_CLUSTERS;
