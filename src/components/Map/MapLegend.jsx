import { useApp } from '../../context/AppContext';
import { VIEWS, COLORS, ROUTE_COLORS, ROUTE_LABELS, DIVISION_COLORS } from '../../utils/constants';
import treaties from '../../data/treaties.json';
import './MapLegend.css';

export default function MapLegend() {
  const { state } = useApp();
  const isRemovalFrame = state.activeView === VIEWS.TREATIES && state.selectedTreatyIndex >= treaties.length;

  return (
    <div className="map-legend">
      {state.activeView === VIEWS.BEFORE && (
        <>
          <div className="legend-title">Cherokee Homeland</div>
          <LegendItem type="fill" color={COLORS.territoryCurrent} label="Cherokee territory (~40,000 sq mi)" />
          <LegendItem type="line-dash" color={COLORS.territoryOriginal} label="Full territorial extent" />
          <div className="legend-divider" />
          <div className="legend-subtitle">Town Divisions</div>
          {Object.entries(DIVISION_COLORS).map(([div, color]) => (
            <LegendItem key={div} type="circle" color={color} label={div.charAt(0).toUpperCase() + div.slice(1) + ' Towns'} />
          ))}
          <LegendItem type="circle-stroke" color="#fbbf24" label="Capital town" />
        </>
      )}
      {state.activeView === VIEWS.TREATIES && !isRemovalFrame && (
        <>
          <div className="legend-title">Treaty Cessions</div>
          <LegendItem type="fill" color={COLORS.territoryCurrent} label="Remaining territory" />
          <LegendItem type="line-dash" color={COLORS.territoryOriginal} label="Original extent" />
          <LegendItem type="circle" color="#fbbf24" label="Population (1 dot = 200)" />
        </>
      )}
      {isRemovalFrame && (
        <>
          <div className="legend-title">The Removal</div>
          {Object.entries(ROUTE_LABELS).map(([key, label]) => (
            <LegendItem key={key} type="line" color={ROUTE_COLORS[key]} label={label} />
          ))}
          <div className="legend-divider" />
          <LegendItem type="circle" color={COLORS.fortMarker} label="Collection forts" />
          <LegendItem type="circle" color="#fbbf24" label="Cherokee on the march" />
          <LegendItem type="circle" color="#dc2626" label="Dying / lost" />
          <LegendItem type="line-dash" color={COLORS.territoryOriginal} label="Original homeland" />
        </>
      )}
      {state.activeView === VIEWS.REMOVAL && (
        <>
          <div className="legend-title">Trail of Tears</div>
          {Object.entries(ROUTE_LABELS).map(([key, label]) => (
            <LegendItem key={key} type="line" color={ROUTE_COLORS[key]} label={label} />
          ))}
          <div className="legend-divider" />
          <LegendItem type="square" color={COLORS.fortMarker} label="Collection forts" />
          <LegendItem type="circle" color={COLORS.waypointMarker} label="Key waypoints" />
          <LegendItem type="line-dash" color={COLORS.territoryOriginal} label="Original homeland" />
        </>
      )}
      {state.activeView === VIEWS.TODAY && (
        <>
          <div className="legend-title">What Remains</div>
          <LegendItem type="fill" color={COLORS.presentCN} label="Cherokee Nation (~7,000 sq mi)" />
          <LegendItem type="fill" color={COLORS.presentEBCI} label="Qualla Boundary (EBCI)" />
          <LegendItem type="line-dash" color={COLORS.territoryOriginal} label="Original homeland (~40,000 sq mi)" />
        </>
      )}
    </div>
  );
}

function LegendItem({ type, color, label }) {
  return (
    <div className="legend-item">
      <span className={`legend-swatch legend-swatch-${type}`} style={{ '--swatch-color': color }} />
      <span className="legend-label">{label}</span>
    </div>
  );
}
