import { useApp } from '../../context/AppContext';
import { VIEWS } from '../../utils/constants';
import treaties from '../../data/treaties.json';
import populationData from '../../data/populationByStage.json';
import { REMOVAL_FRAMES } from '../Timeline/TimelineSlider';
import './PopulationOverlay.css';

export default function PopulationOverlay() {
  const { state } = useApp();
  const { activeView, selectedTreatyIndex } = state;

  const isRemovalFrame = activeView === VIEWS.TREATIES && selectedTreatyIndex >= treaties.length;

  // Migration frame (slider in removal phase) — show per-frame marching/lost stats
  if (isRemovalFrame) {
    const frame = REMOVAL_FRAMES[selectedTreatyIndex - treaties.length];
    if (!frame) return null;
    return (
      <div className="population-overlay population-overlay--removal">
        <div className="pop-dot-key">
          <span className="pop-dot-swatch" />
          <span className="pop-dot-label">1 dot = 200 people</span>
        </div>
        <div className="pop-stat-row">
          <span className="pop-stat-label">Marching</span>
          <span className="pop-stat-value">{frame.marching.toLocaleString()}</span>
        </div>
        <div className="pop-stat-row pop-stat-loss">
          <span className="pop-stat-label">Lost</span>
          <span className="pop-stat-value pop-stat-death">
            {frame.lostSoFar > 0 ? `~${frame.lostSoFar.toLocaleString()}` : '0'}
          </span>
        </div>
        <div className="pop-stat-note">{frame.detail}</div>
      </div>
    );
  }

  let stage = null;
  let showOverlay = false;

  if (activeView === VIEWS.BEFORE) {
    stage = populationData.stages.precontact;
    showOverlay = true;
  } else if (activeView === VIEWS.TREATIES) {
    const treaty = treaties[selectedTreatyIndex];
    if (treaty) {
      stage = populationData.stages[treaty.territoryKey];
      showOverlay = true;
    }
  } else if (activeView === VIEWS.REMOVAL) {
    stage = populationData.stages.removal;
    showOverlay = true;
  } else if (activeView === VIEWS.TODAY) {
    stage = populationData.stages.today;
    showOverlay = true;
  }

  if (!showOverlay || !stage) return null;

  if (activeView === VIEWS.REMOVAL) {
    return (
      <div className="population-overlay population-overlay--removal">
        <div className="pop-stat-row">
          <span className="pop-stat-label">Forced to march</span>
          <span className="pop-stat-value">{stage.population.toLocaleString()}</span>
        </div>
        <div className="pop-stat-row pop-stat-loss">
          <span className="pop-stat-label">Died on the trail</span>
          <span className="pop-stat-value pop-stat-death">~{stage.deaths.toLocaleString()}</span>
        </div>
        <div className="pop-stat-note">{stage.note}</div>
      </div>
    );
  }

  if (activeView === VIEWS.TODAY) {
    return (
      <div className="population-overlay population-overlay--today">
        <div className="pop-stat-row">
          <span className="pop-stat-label">Cherokee citizens today</span>
          <span className="pop-stat-value pop-stat-growth">{stage.population.toLocaleString()}</span>
        </div>
        <div className="pop-stat-note">{stage.note}</div>
      </div>
    );
  }

  // Before + Treaties views
  const densityStr = stage.density ? `${stage.density.toFixed(1)} per sq mi` : '0';

  return (
    <div className="population-overlay">
      <div className="pop-dot-key">
        <span className="pop-dot-swatch" />
        <span className="pop-dot-label">1 dot = 200 people</span>
      </div>
      <div className="pop-stat-row">
        <span className="pop-stat-label">Population</span>
        <span className="pop-stat-value">~{stage.population.toLocaleString()}</span>
      </div>
      {stage.sqMiles > 0 && (
        <div className="pop-stat-row">
          <span className="pop-stat-label">Density</span>
          <span className="pop-stat-value">{densityStr}</span>
        </div>
      )}
      {stage.sqMiles === 0 && (
        <div className="pop-stat-row pop-stat-loss">
          <span className="pop-stat-label">Territory</span>
          <span className="pop-stat-value pop-stat-death">0 sq mi</span>
        </div>
      )}
    </div>
  );
}
