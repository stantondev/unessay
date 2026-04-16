export const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11';

export const VIEWS = {
  BEFORE: 'before',
  TREATIES: 'treaties',
  REMOVAL: 'removal',
  TODAY: 'today',
};

export const VIEW_CONFIGS = {
  [VIEWS.BEFORE]: {
    center: [-83.8, 35.3],
    zoom: 6.5,
    label: 'The World Before',
  },
  [VIEWS.TREATIES]: {
    center: [-84.0, 35.0],
    zoom: 6,
    label: 'Treaty by Treaty',
  },
  [VIEWS.REMOVAL]: {
    center: [-89.5, 36.5],
    zoom: 4.5,
    label: 'The Trail of Tears',
  },
  [VIEWS.TODAY]: {
    center: [-89.0, 35.5],
    zoom: 4.5,
    label: 'What Remains',
  },
};

export const COLORS = {
  territoryOriginal: '#8B4513',
  territoryGhost: 'rgba(139, 69, 19, 0.08)',
  territoryGhostBorder: 'rgba(139, 69, 19, 0.25)',
  territoryCurrent: '#2d5a27',
  territoryCeded: '#8B0000',
  routeNorthern: '#e6a817',
  routeBenge: '#c45b28',
  routeBell: '#7b3294',
  routeWater: '#2166ac',
  fortMarker: '#dc2626',
  waypointMarker: '#f59e0b',
  townOverhill: '#3b82f6',
  townMiddle: '#22c55e',
  townLower: '#f97316',
  townOut: '#a855f7',
  townValley: '#ef4444',
  townChickamauga: '#dc2626',
  townCapital: '#fbbf24',
  presentCN: '#1e40af',
  presentEBCI: '#15803d',
  presentUKB: '#7c3aed',
  personalStory: '#ec4899',
};

export const DIVISION_COLORS = {
  overhill: COLORS.townOverhill,
  middle: COLORS.townMiddle,
  lower: COLORS.townLower,
  out: COLORS.townOut,
  valley: COLORS.townValley,
  chickamauga: COLORS.townChickamauga,
};

export const ROUTE_COLORS = {
  'northern-overland': COLORS.routeNorthern,
  benge: COLORS.routeBenge,
  bell: COLORS.routeBell,
  water: COLORS.routeWater,
};

export const ROUTE_LABELS = {
  'northern-overland': 'Northern Overland Route',
  benge: 'Benge Route (Southern)',
  bell: 'Bell Route (Treaty Party)',
  water: 'Water Route',
};
