// Territory time-lapse stages — shared between the TerritoryTimelapse control
// and MapView (which reads the stage's `key` to swap the territory polygon).
// Each `key` matches an entry in TERRITORY_MAP in MapView.jsx.
export const TIMELAPSE_STAGES = [
  { key: 'precontact', year: 'c. 1700', sqMiles: 40000, percentLost: 0,   event: 'Cherokee homeland \u2014 40,000 sq mi across 8 modern states.' },
  { key: '1777',       year: '1777',    sqMiles: 32000, percentLost: 20,  event: 'Treaties of DeWitt\u2019s Corner and Long Island of Holston.' },
  { key: '1785',       year: '1785',    sqMiles: 30000, percentLost: 25,  event: 'Treaty of Hopewell \u2014 first U.S.\u2013Cherokee treaty.' },
  { key: '1791',       year: '1791',    sqMiles: 27000, percentLost: 33,  event: 'Treaty of Holston \u2014 "guaranteed forever."' },
  { key: '1798',       year: '1798',    sqMiles: 23000, percentLost: 43,  event: 'Treaty of Tellico \u2014 broken within six years.' },
  { key: '1806',       year: '1806',    sqMiles: 18000, percentLost: 55,  event: 'Meigs Treaties \u2014 a federal road through the heart.' },
  { key: '1814',       year: '1814',    sqMiles: 14000, percentLost: 65,  event: 'Treaty of Fort Jackson \u2014 land taken from allies.' },
  { key: '1819',       year: '1819',    sqMiles: 10000, percentLost: 75,  event: '"Not one more foot of land." \u2014 Cherokee Council' },
  { key: '1835',       year: '1835',    sqMiles: 0,     percentLost: 100, event: 'Treaty of New Echota \u2014 all remaining territory ceded.' },
];

// Wide homeland fly-to for the time-lapse view
export const TIMELAPSE_CAMERA = {
  center: [-84.0, 35.2],
  zoom: 6.0,
  bearing: 0,
  pitch: 20,
};
