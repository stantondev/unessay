import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SCENES } from '../../data/scenes';
import './PopulationRibbon.css';

// Cherokee population timeline — a continuous spine across the app's 324-year
// arc. Each point is a documented or well-estimated Cherokee population at a
// given year, annotated when it marks a historical cliff or turning point.
//
// Sources:
//   Mooney, James. Myths of the Cherokee (1900)
//   Thornton, Russell. American Indian Holocaust and Survival (1987)
//   1835 Henderson Roll
//   1907 Dawes Roll
//   Cherokee Nation enrollment reports (2020, 2024)
const POPULATION_POINTS = [
  { year: 1700, cherokee: 32000, event: null },
  { year: 1738, cherokee: 33000, event: { kind: 'pre', label: 'Pre-smallpox peak', detail: '~64 towns, 33,000 people' } },
  { year: 1740, cherokee: 14000, event: { kind: 'cliff', label: 'Smallpox, 1738–40', detail: 'Smallpox killed roughly half the Cherokee population — the fastest demographic collapse in Cherokee history.' } },
  { year: 1760, cherokee: 13000, event: null },
  { year: 1785, cherokee: 16000, event: null },
  { year: 1800, cherokee: 16000, event: null },
  { year: 1819, cherokee: 15500, event: { kind: 'note', label: '"Old Settlers" depart', detail: '1,500–2,000 Cherokee voluntarily emigrated west under the 1817 treaty.' } },
  { year: 1835, cherokee: 16542, event: { kind: 'pre', label: 'Henderson Roll', detail: '16,542 Cherokee + 201 whites + 1,592 enslaved, documented on the eve of removal.' } },
  { year: 1839, cherokee: 12500, event: { kind: 'cliff', label: 'Trail of Tears', detail: '2,000–4,000 Cherokee died in camps, during the march, and in the first year after arrival.' } },
  { year: 1866, cherokee: 14000, event: { kind: 'cliff', label: 'Civil War', detail: 'Estimates of Cherokee mortality in the Civil War range from one in four to one in three — a second demographic catastrophe within a generation.' } },
  { year: 1890, cherokee: 22000, event: null },
  { year: 1907, cherokee: 40000, event: { kind: 'erasure', label: 'OK statehood', detail: 'Cherokee Nation government dissolved by federal law. For 64 years the Nation had no federally recognized chief.' } },
  { year: 1950, cherokee: 30000, event: null },
  { year: 1970, cherokee: 70000, event: { kind: 'rise', label: 'Principal Chiefs Act', detail: 'Cherokee Nation regains the right to elect its own chief for the first time since 1906.' } },
  { year: 1985, cherokee: 110000, event: { kind: 'rise', label: 'Wilma Mankiller elected', detail: 'First woman elected Principal Chief of the Cherokee Nation.' } },
  { year: 2000, cherokee: 270000, event: null },
  { year: 2020, cherokee: 450000, event: { kind: 'rise', label: 'McGirt v. Oklahoma', detail: 'U.S. Supreme Court affirms that the Muscogee reservation was never disestablished — with direct implications for Cherokee reservation sovereignty.' } },
  { year: 2024, cherokee: 496000, event: { kind: 'rise', label: '466,000 citizens', detail: 'The Cherokee Nation — 466,000+ citizens — is now the largest tribal nation in the United States. Combined with EBCI (~16,000) and UKB (~14,000).' } },
];

// Chart bounds
const YEAR_MIN = 1700;
const YEAR_MAX = 2030;
// Square-root scale balances the 12k-era and 500k-modern numbers
const POP_MAX = 500000;
function popScale(pop) {
  return Math.sqrt(Math.max(0, pop) / POP_MAX);
}

// Find Cherokee population at an arbitrary year via linear interpolation
function populationAt(year) {
  if (year <= POPULATION_POINTS[0].year) return POPULATION_POINTS[0].cherokee;
  if (year >= POPULATION_POINTS[POPULATION_POINTS.length - 1].year) {
    return POPULATION_POINTS[POPULATION_POINTS.length - 1].cherokee;
  }
  for (let i = 0; i < POPULATION_POINTS.length - 1; i++) {
    const a = POPULATION_POINTS[i];
    const b = POPULATION_POINTS[i + 1];
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year);
      return a.cherokee + (b.cherokee - a.cherokee) * t;
    }
  }
  return 0;
}

export default function PopulationRibbon() {
  const { state } = useApp();
  const scene = SCENES[state.currentSceneIndex];
  const currentYear = scene?.effectiveYear || 1700;
  const currentPop = populationAt(currentYear);

  const [hovered, setHovered] = useState(null);

  // Dimensions in SVG units (will scale via CSS)
  const W = 1000;
  const H = 80;
  const PAD_X = 8;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 20;

  // Chart mapping helpers
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  function x(year) {
    return PAD_X + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * chartW;
  }
  function y(pop) {
    return PAD_TOP + chartH - popScale(pop) * chartH;
  }

  // Build path: one line across all points
  const pathD = useMemo(() => {
    return POPULATION_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.year).toFixed(2)} ${y(p.cherokee).toFixed(2)}`).join(' ');
  }, []);

  // Build closed area path for fill under the line
  const areaD = useMemo(() => {
    const head = POPULATION_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.year).toFixed(2)} ${y(p.cherokee).toFixed(2)}`).join(' ');
    const last = POPULATION_POINTS[POPULATION_POINTS.length - 1];
    const first = POPULATION_POINTS[0];
    const base = `L ${x(last.year).toFixed(2)} ${(PAD_TOP + chartH).toFixed(2)} L ${x(first.year).toFixed(2)} ${(PAD_TOP + chartH).toFixed(2)} Z`;
    return `${head} ${base}`;
  }, []);

  // Decade grid
  const gridYears = [1700, 1750, 1800, 1850, 1900, 1950, 2000];
  const popLabels = [
    { value: 15000, label: '15K' },
    { value: 100000, label: '100K' },
    { value: 500000, label: '500K' },
  ];

  const hoverItem = hovered != null ? POPULATION_POINTS[hovered] : null;

  return (
    <div className="pop-ribbon" aria-label="Cherokee population timeline from 1700 to 2024">
      <div className="pop-ribbon-header">
        <div className="pop-ribbon-title">Cherokee Population · 1700 — 2024</div>
        <div className="pop-ribbon-current">
          <span className="pop-ribbon-current-year">{Math.round(currentYear)}</span>
          <span className="pop-ribbon-current-sep">·</span>
          <span className="pop-ribbon-current-pop">{Math.round(currentPop).toLocaleString()}</span>
        </div>
      </div>
      <svg
        className="pop-ribbon-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-describedby="pop-ribbon-desc"
      >
        <defs>
          <linearGradient id="pop-ribbon-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Year gridlines */}
        {gridYears.map((gy) => (
          <g key={`gy-${gy}`}>
            <line
              x1={x(gy)}
              y1={PAD_TOP}
              x2={x(gy)}
              y2={PAD_TOP + chartH}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text
              x={x(gy)}
              y={H - 5}
              fontSize="9"
              textAnchor="middle"
              fill="#64748b"
              fontFamily="var(--font-mono, monospace)"
            >{gy}</text>
          </g>
        ))}

        {/* Population reference lines */}
        {popLabels.map((p) => (
          <g key={`pr-${p.value}`}>
            <line
              x1={PAD_X}
              y1={y(p.value)}
              x2={W - PAD_X}
              y2={y(p.value)}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
            <text
              x={W - PAD_X - 2}
              y={y(p.value) - 1}
              fontSize="8"
              textAnchor="end"
              fill="#475569"
              fontFamily="var(--font-mono, monospace)"
            >{p.label}</text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#pop-ribbon-fill)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Event markers */}
        {POPULATION_POINTS.map((p, i) => {
          if (!p.event) return null;
          const cx = x(p.year);
          const cy = y(p.cherokee);
          const color = {
            cliff: '#ef4444',
            erasure: '#f97316',
            pre: '#fbbf24',
            note: '#64748b',
            rise: '#4ade80',
          }[p.event.kind] || '#fbbf24';
          return (
            <g key={`ev-${i}`}>
              <circle
                cx={cx}
                cy={cy}
                r={p.event.kind === 'cliff' ? 4 : 3}
                fill={color}
                stroke="#0a0f1a"
                strokeWidth="1"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              />
            </g>
          );
        })}

        {/* Current-year indicator */}
        <g>
          <line
            x1={x(currentYear)}
            y1={PAD_TOP - 2}
            x2={x(currentYear)}
            y2={PAD_TOP + chartH + 2}
            stroke="#fef3c7"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <circle
            cx={x(currentYear)}
            cy={y(currentPop)}
            r="4"
            fill="#fef3c7"
            stroke="#0a0f1a"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      <p id="pop-ribbon-desc" className="visually-hidden">
        A line chart showing Cherokee population from 1700 to 2024. Key inflection points:
        the 1738 smallpox epidemic halved the population; the 1838–39 Trail of Tears killed
        2,000–4,000; the Civil War took another quarter; Oklahoma statehood in 1907
        dissolved the Cherokee government for 64 years. The Cherokee Nation today has over
        466,000 enrolled citizens — the largest tribal nation in the United States.
      </p>

      {hoverItem && hoverItem.event && (
        <div
          className="pop-ribbon-tooltip"
          style={{ left: `${(x(hoverItem.year) / W) * 100}%` }}
          role="tooltip"
        >
          <div className={`pop-ribbon-tooltip-kind pop-ribbon-tooltip-kind--${hoverItem.event.kind}`}>
            {hoverItem.year}
          </div>
          <div className="pop-ribbon-tooltip-label">{hoverItem.event.label}</div>
          <div className="pop-ribbon-tooltip-pop">
            {Math.round(hoverItem.cherokee).toLocaleString()} Cherokee
          </div>
          <div className="pop-ribbon-tooltip-detail">{hoverItem.event.detail}</div>
        </div>
      )}
    </div>
  );
}
