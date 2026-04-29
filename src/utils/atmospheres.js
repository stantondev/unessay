// ============================================================================
// ATMOSPHERE PRESETS
//
// Each preset tunes the map's visual mood: fog (atmosphere color), directional
// light (sun position + intensity), terrain exaggeration, and hillshade color.
// Presets are applied per-scene so moving between chapters feels atmospheric,
// not just informational — the Appalachian homeland wears morning gold; the
// Trail of Tears scenes wear winter gray; the modern chapters wear clear day.
//
// Fog reference (Mapbox GL v3): "fog" is really the atmosphere/sky ring.
//   color        — horizon color (what you see at the world's edge)
//   high-color   — upper-atmosphere color (toward zenith when pitched)
//   space-color  — space dome beyond the atmosphere
//   horizon-blend— how soft the transition is (0..1)
//   star-intensity — star brightness in space (0..1)
//
// Light reference (Mapbox GL v3):
//   position = [radial, azimuthal, polar]
//     radial     — distance (typical 1.0–1.5)
//     azimuthal  — sun direction in degrees (0 = north, 90 = east, 180 = south, 270 = west)
//     polar      — altitude above ground (0 = horizon, 90 = zenith)
// ============================================================================

export const ATMOSPHERES = {
  // Dawn golden — ancient Cherokee homeland waking in morning light.
  // Warm amber horizon, slightly cool sky above, sun low from the SE.
  golden: {
    fog: {
      color: 'rgb(68, 46, 28)', // warm amber-brown at horizon
      'high-color': 'rgb(32, 38, 54)', // deep blue above
      'space-color': 'rgb(10, 14, 24)',
      'horizon-blend': 0.08,
      'star-intensity': 0.05,
    },
    light: {
      anchor: 'map',
      color: '#ffe7b8', // warm morning gold
      intensity: 0.55,
      position: [1.3, 120, 35], // low sun from east-southeast
    },
    terrainExaggeration: 1.9, // exaggerate the Appalachians at dawn
    hillshade: {
      exaggeration: 0.65,
      shadowColor: '#1a0d08',
      highlightColor: '#d4a574',
      accentColor: '#8b6f47',
    },
  },

  // Autumn / treaty era — neutral, slightly muted. The dignity of negotiation,
  // the creeping encroachment. Light from overhead, subdued color.
  autumn: {
    fog: {
      color: 'rgb(42, 46, 52)',
      'high-color': 'rgb(22, 28, 42)',
      'space-color': 'rgb(10, 14, 24)',
      'horizon-blend': 0.1,
      'star-intensity': 0.1,
    },
    light: {
      anchor: 'map',
      color: '#e8d9b8',
      intensity: 0.5,
      position: [1.2, 180, 55],
    },
    terrainExaggeration: 1.6,
    hillshade: {
      exaggeration: 0.55,
      shadowColor: '#0a0f1a',
      highlightColor: '#9a8468',
      accentColor: '#4a5a42',
    },
  },

  // Winter / removal — the winter of 1838–39 was the worst on record. Frozen
  // rivers, gray skies, the cold that killed so many. Cold blue, desaturated.
  winter: {
    fog: {
      color: 'rgb(58, 70, 88)', // cold gray-blue at horizon
      'high-color': 'rgb(18, 24, 38)',
      'space-color': 'rgb(6, 9, 18)',
      'horizon-blend': 0.14,
      'star-intensity': 0.12,
    },
    light: {
      anchor: 'map',
      color: '#c5d4e0', // pale winter blue
      intensity: 0.35, // winter sun is weak
      position: [1.4, 210, 18], // very low, southern (winter sun at low latitudes)
    },
    terrainExaggeration: 1.4, // slightly flatter — winter crossings don't feel epic, they feel grueling
    hillshade: {
      exaggeration: 0.45,
      shadowColor: '#050811',
      highlightColor: '#7d8fa0',
      accentColor: '#3a4858',
    },
  },

  // Blood / battle — Horseshoe Bend, the land lottery, the removal act.
  // Red-tinged, tense. Sun from the direction of approach.
  blood: {
    fog: {
      color: 'rgb(62, 32, 28)', // blood-red at horizon
      'high-color': 'rgb(28, 22, 32)',
      'space-color': 'rgb(8, 8, 14)',
      'horizon-blend': 0.1,
      'star-intensity': 0.08,
    },
    light: {
      anchor: 'map',
      color: '#f0b090',
      intensity: 0.55,
      position: [1.3, 270, 25], // low sun from the west (the army's direction)
    },
    terrainExaggeration: 1.75,
    hillshade: {
      exaggeration: 0.6,
      shadowColor: '#1a0808',
      highlightColor: '#b67770',
      accentColor: '#6a3e3e',
    },
  },

  // Clear / today — the Cherokee Nation present. Bright, forward-looking,
  // the day the descendants live in. Clean sky, balanced light.
  clear: {
    fog: {
      color: 'rgb(96, 118, 148)', // daytime blue
      'high-color': 'rgb(48, 70, 108)',
      'space-color': 'rgb(12, 20, 38)',
      'horizon-blend': 0.06,
      'star-intensity': 0.0,
    },
    light: {
      anchor: 'map',
      color: '#ffffff',
      intensity: 0.6,
      position: [1.15, 200, 60], // high sun, slightly south
    },
    terrainExaggeration: 1.55,
    hillshade: {
      exaggeration: 0.5,
      shadowColor: '#1a2030',
      highlightColor: '#b8c8d8',
      accentColor: '#5a7050',
    },
  },
};

// Default atmosphere for the app's four chapters.
// A scene may override with its own `atmosphere` value.
export const CHAPTER_DEFAULT_ATMOSPHERE = {
  Before: 'golden',
  Treaties: 'autumn',
  Removal: 'winter',
  Today: 'clear',
};

/**
 * Apply an atmosphere preset to a Mapbox map instance.
 * Uses setFog/setLight/setTerrain/setPaintProperty to animate the transition.
 */
export function applyAtmosphere(map, atmosphereName) {
  const preset = ATMOSPHERES[atmosphereName] || ATMOSPHERES.autumn;
  if (!map) return;

  try {
    map.setFog(preset.fog);
  } catch {}

  try {
    map.setLight({
      anchor: preset.light.anchor,
      color: preset.light.color,
      intensity: preset.light.intensity,
      position: preset.light.position,
    });
  } catch {}

  try {
    map.setTerrain({ source: 'mapbox-dem', exaggeration: preset.terrainExaggeration });
  } catch {}

  try {
    if (map.getLayer('custom-hillshade')) {
      map.setPaintProperty('custom-hillshade', 'hillshade-exaggeration', preset.hillshade.exaggeration);
      map.setPaintProperty('custom-hillshade', 'hillshade-shadow-color', preset.hillshade.shadowColor);
      map.setPaintProperty('custom-hillshade', 'hillshade-highlight-color', preset.hillshade.highlightColor);
      map.setPaintProperty('custom-hillshade', 'hillshade-accent-color', preset.hillshade.accentColor);
    }
  } catch {}
}
