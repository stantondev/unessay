import { useApp } from '../../context/AppContext';
import { VIEWS } from '../../utils/constants';
import treaties from '../../data/treaties.json';
import detachments from '../../data/detachments.json';
import population from '../../data/population.json';
import presentDay from '../../data/presentDay.json';
import './InfoPanel.css';

export default function InfoPanel() {
  const { state, dispatch } = useApp();

  if (!state.infoPanelOpen) {
    return (
      <button
        className="info-panel-toggle"
        onClick={() => dispatch({ type: 'TOGGLE_INFO_PANEL' })}
        title="Open info panel"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4h12v1.5H2zM2 7.25h12v1.5H2zM2 10.5h12v1.5H2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <h2 className="info-panel-title">
          {state.activeView === VIEWS.BEFORE && 'The World Before'}
          {state.activeView === VIEWS.TREATIES && 'Treaty Details'}
          {state.activeView === VIEWS.REMOVAL && 'The Trail of Tears'}
          {state.activeView === VIEWS.TODAY && 'What Remains'}
        </h2>
        <button
          className="info-panel-close"
          onClick={() => dispatch({ type: 'CLOSE_INFO_PANEL' })}
        >
          &times;
        </button>
      </div>
      <div className="info-panel-body">
        {state.activeView === VIEWS.BEFORE && <BeforeContent />}
        {state.activeView === VIEWS.TREATIES && <TreatiesContent index={state.selectedTreatyIndex} />}
        {state.activeView === VIEWS.REMOVAL && <RemovalContent />}
        {state.activeView === VIEWS.TODAY && <TodayContent />}
      </div>
    </div>
  );
}

function BeforeContent() {
  return (
    <div className="info-content">
      <div className="info-section">
        <h3>Cherokee Homeland</h3>
        <p>
          Before European contact, the Cherokee people occupied approximately <strong>40,000 square miles</strong> across
          parts of eight modern states: North Carolina, South Carolina, Tennessee, Georgia, Alabama, Virginia, West Virginia, and Kentucky.
        </p>
        <p>
          The Cherokee population was an estimated <strong>25,000 to 36,000 people</strong> living in approximately 64 towns
          organized across five divisions: Overhill, Middle, Lower, Out, and Valley towns.
        </p>
      </div>
      <div className="info-section">
        <h3>A Continent of Nations</h3>
        <p>
          The Americas in 1492 were home to an estimated 100 million people. The population of North America
          (present-day U.S.) was between 5 and 18 million — comparable to or greater than the population of many European kingdoms.
        </p>
      </div>
      <div className="info-section">
        <h3>Population Over Time</h3>
        <div className="info-table">
          {population.timeline.map((row) => (
            <div key={row.year} className="info-table-row">
              <span className="info-table-year">{row.year}</span>
              <span className="info-table-value">{row.cherokee || '\u2014'}</span>
              <span className="info-table-context">{row.context}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="info-stat-callout">
        {population.keyStat}
      </div>
    </div>
  );
}

function TreatiesContent({ index }) {
  const treaty = treaties[index];
  if (!treaty) return null;

  return (
    <div className="info-content">
      <div className="info-section">
        <div className="treaty-header">
          <span className="treaty-date">{treaty.date}</span>
          <h3>{treaty.name}</h3>
          {treaty.location && <span className="treaty-location">{treaty.location}</span>}
        </div>
      </div>
      <div className="info-section">
        <h4>What Was Ceded</h4>
        <p>{treaty.ceded}</p>
      </div>
      <div className="info-section">
        <p className="treaty-detail">{treaty.detail}</p>
      </div>
      <div className="info-section">
        <div className="treaty-remaining">
          <span className="remaining-label">Territory Remaining</span>
          <span className="remaining-value">
            {treaty.sqMilesRemaining > 0
              ? `~${treaty.sqMilesRemaining.toLocaleString()} sq mi`
              : 'None \u2014 all ceded'}
          </span>
          <div className="remaining-bar">
            <div
              className="remaining-bar-fill"
              style={{ width: `${(treaty.sqMilesRemaining / 40000) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {index > 0 && (
        <div className="info-section">
          <h4>Political Context</h4>
          {treaty.year >= 1827 && treaty.year <= 1835 && (
            <ul className="context-list">
              <li>Cherokee Constitution adopted July 24, 1827</li>
              <li>Cherokee Phoenix first published February 21, 1828</li>
              <li>Dahlonega gold rush began 1829</li>
              <li>Indian Removal Act passed House 102\u201397 (May 26, 1830)</li>
              <li>Worcester v. Georgia (March 3, 1832): Supreme Court ruled Cherokee Nation is a &quot;distinct community&quot; where Georgia laws have no force</li>
              <li>Georgia land lottery distributed occupied Cherokee land 1832\u201333</li>
            </ul>
          )}
          {treaty.year < 1827 && (
            <p className="context-note">
              Each treaty established boundaries that settlers immediately violated, creating the pretext for the next land cession.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RemovalContent() {
  return (
    <div className="info-content">
      <div className="info-section">
        <h3>The Removal</h3>
        <p>
          On May 17, 1838, General Winfield Scott arrived at New Echota with approximately 7,000 troops.
          Thirty-one forts were constructed across four states to round up the Cherokee people: 13 in Georgia, 8 in Tennessee, 5 in North Carolina, and 5 in Alabama.
        </p>
        <p>
          Over 16,000 Cherokee were forced from their homes. Eleven internment camps near Charleston, TN held
          over 6,000 Cherokee. An estimated 1,500 or more died in the camps before the journey even began.
        </p>
      </div>
      <div className="info-section">
        <h3>13 Cherokee-Managed Detachments</h3>
        <p className="info-note">{detachments.context.background}</p>
        <div className="detachment-list">
          {detachments.detachments.map((d) => (
            <div key={d.id} className="detachment-card">
              <div className="detachment-header">
                <span className="detachment-number">#{d.id}</span>
                <span className="detachment-conductor">{d.conductor}</span>
              </div>
              <div className="detachment-details">
                {d.departed && <span>Departed: {d.departed}</span>}
                {d.people && <span>{d.people.toLocaleString()} people</span>}
                {d.arrived && <span>Arrived: {d.arrived}</span>}
                {d.deaths != null && <span className="detachment-deaths">{d.deaths} deaths</span>}
              </div>
              {d.notes && <p className="detachment-notes">{d.notes}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="info-section">
        <h3>Mortality</h3>
        <p>
          Total deaths: <strong>2,000 to 4,000</strong> (National Park Service; Smithsonian NMAI).
          {' '}561 deaths were documented in official records of Ross-managed detachments, but four detachments did not file reports.
        </p>
        <p className="info-note">
          Causes: {detachments.context.causes}
        </p>
        <p className="info-note">
          {detachments.context.conditions}
        </p>
      </div>
    </div>
  );
}

function TodayContent() {
  return (
    <div className="info-content">
      <div className="info-section">
        <h3>The Cherokee Nation Is Not a Historical Relic</h3>
        <p>
          Today, the Cherokee Nation is the <strong>largest tribal nation in the United States</strong> with
          over 466,000 citizens living in all 50 states. The Cherokee people are a sovereign nation with their
          own government, courts, and constitution.
        </p>
      </div>
      {presentDay.nations.map((nation) => (
        <div key={nation.id} className="info-section nation-card">
          <h3>{nation.name}</h3>
          <div className="nation-details">
            <div className="nation-detail">
              <span className="detail-label">Enrollment</span>
              <span className="detail-value">{nation.enrollment}</span>
            </div>
            <div className="nation-detail">
              <span className="detail-label">Headquarters</span>
              <span className="detail-value">{nation.capital}</span>
            </div>
            <div className="nation-detail">
              <span className="detail-label">Territory</span>
              <span className="detail-value">{nation.territory}</span>
            </div>
            <div className="nation-detail">
              <span className="detail-label">Citizenship</span>
              <span className="detail-value">{nation.citizenship}</span>
            </div>
            {nation.economicImpact && (
              <div className="nation-detail">
                <span className="detail-label">Economic Impact</span>
                <span className="detail-value">{nation.economicImpact}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="info-section">
        <h3>Milestones of Return</h3>
        {presentDay.milestones.map((m) => (
          <div key={m.year} className="milestone">
            <span className="milestone-year">{m.date || m.year}</span>
            <span className="milestone-event">{m.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
