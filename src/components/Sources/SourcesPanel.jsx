import { useApp } from '../../context/AppContext';
import sources from '../../data/sources.json';
import './SourcesPanel.css';

export default function SourcesPanel() {
  const { state, dispatch } = useApp();

  if (!state.sourcesOpen) return null;

  return (
    <div className="sources-overlay">
      <div className="sources-panel">
        <div className="sources-header">
          <h2>Sources & Bibliography</h2>
          <button
            className="sources-close"
            onClick={() => dispatch({ type: 'TOGGLE_SOURCES' })}
          >
            &times;
          </button>
        </div>
        <div className="sources-body">
          <div className="sources-section">
            <h3>Core Textbook</h3>
            <p className="source-citation">{sources.courseTextbook.citation}</p>
          </div>

          <div className="sources-section">
            <h3>Cherokee-Authored & Cherokee Nation Sources</h3>
            {sources.cherokeeAuthored.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Core Academic Works</h3>
            {sources.coreAcademic.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Population & Land Data</h3>
            {sources.populationAndLand.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Primary Source Archives</h3>
            {sources.primarySources.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Settler Town Founding Dates</h3>
            <p className="source-note">
              Founding years and locations for the colonial settlements that
              appear on the map as the timeline advances.
            </p>
            {sources.settlerTownFoundings.map((s, i) => (
              <p key={i} className="source-citation">{s.citation}</p>
            ))}
          </div>

          <div className="sources-section">
            <h3>Course Sources by Unit</h3>
            {sources.courseSources.map((unit) => (
              <div key={unit.unit} className="course-unit">
                <h4>{unit.unit}</h4>
                <ul>
                  {unit.sources.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="sources-section sources-note">
            <h3>About This Project</h3>
            <p>
              <strong>What Was Here Before</strong> was created by Stanton Melvin as an unessay for
              Introduction to Native American History, taught by Professor Charmayne &ldquo;Charli&rdquo; Champion-Shaw.
            </p>
            <p>
              This application maps Cherokee homeland, treaty-by-treaty territorial loss from 1721 to 1835,
              the Trail of Tears at the detachment level, and Cherokee sovereignty today. All historical claims
              are sourced from the bibliography above. Territorial boundaries are approximations based on
              Charles C. Royce&apos;s 1884 historical maps of Cherokee territorial limits.
            </p>
            <p>
              No existing project integrates all three eras &mdash; pre-contact homeland, treaty-by-treaty
              dispossession, and the removal itself &mdash; in a single, open-source, publicly accessible platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
