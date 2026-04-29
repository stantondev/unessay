import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './MapOverlayControl.css';

export default function MapOverlayControl() {
  const { state, dispatch } = useApp();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="map-overlay-control">
      <button
        type="button"
        className={`moc-toggle ${state.royceMapVisible ? 'moc-toggle--active' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_ROYCE_MAP' })}
        aria-pressed={state.royceMapVisible}
        title="Toggle the 1884 Royce map overlay"
      >
        <span className="moc-toggle-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 3.5L5 1.5L9 3.5L13 1.5V10.5L9 12.5L5 10.5L1 12.5V3.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
            <path d="M5 1.5V10.5M9 3.5V12.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
        <span className="moc-toggle-label">
          <span className="moc-toggle-title">Royce 1884</span>
          <span className="moc-toggle-sub">Historical overlay</span>
        </span>
        <span className="moc-toggle-status" aria-hidden="true">
          {state.royceMapVisible ? 'ON' : 'OFF'}
        </span>
      </button>

      {state.royceMapVisible && (
        <div className="moc-opacity">
          <label htmlFor="moc-opacity-slider" className="moc-opacity-label">
            Opacity
          </label>
          <input
            id="moc-opacity-slider"
            type="range"
            min="0.2"
            max="1"
            step="0.02"
            value={state.royceMapOpacity}
            onChange={(e) =>
              dispatch({ type: 'SET_ROYCE_OPACITY', payload: parseFloat(e.target.value) })
            }
            className="moc-opacity-slider"
            aria-label="Royce map opacity"
          />
          <span className="moc-opacity-value">{Math.round(state.royceMapOpacity * 100)}%</span>
        </div>
      )}

      <button
        type="button"
        className="moc-info-button"
        onClick={() => setInfoOpen(!infoOpen)}
        aria-expanded={infoOpen}
        aria-label={infoOpen ? 'Hide Royce map details' : 'About the Royce map'}
      >
        {infoOpen ? '×' : '?'}
      </button>

      {infoOpen && (
        <div className="moc-info-panel">
          <h4 className="moc-info-title">Charles C. Royce, 1884</h4>
          <p className="moc-info-text">
            <em>Map of the Former Territorial Limits of the Cherokee &ldquo;Nation of&rdquo;
            Indians, Exhibiting the Boundaries of the Various Cessions of Land Made by
            Them to the United States by Treaty Stipulations</em>.
          </p>
          <p className="moc-info-text">
            Published in the <em>Fifth Annual Report of the Bureau of American
            Ethnology</em>, this map became the federal government&rsquo;s definitive
            reference for Cherokee cession boundaries. Every numbered polygon on the
            treaty timeline in this app traces back to a numbered area on this plate.
          </p>
          <p className="moc-info-source">
            Public Domain. Scan courtesy U.S. National Archives via Wikimedia Commons.{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Map_of_the_Former_Territorial_Limits_of_the_Cherokee_%22Nation_of%22_Indians_Exhibiting_the_Boundaries_of_the_Various_Cessions_of_Land_Made_by_Them_to_the_United_States_by_Treaty_Stipulations,_from_the_Beginning_of_(...)_-_NARA_-_102278418.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              View original →
            </a>
          </p>
          <p className="moc-info-caveat">
            The overlay is approximately georeferenced to modern coordinates using the
            original plate&rsquo;s printed extent. Some areas (especially along rivers)
            may appear slightly offset because 19th-century surveys used different
            reference datums than modern GPS.
          </p>
        </div>
      )}
    </div>
  );
}
