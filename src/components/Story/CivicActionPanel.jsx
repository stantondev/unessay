import { useState } from 'react';
import civicActions from '../../data/civicActions.json';
import './CivicActionPanel.css';

const CATEGORY_ICONS = {
  donate: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 14.5S2 10.5 2 6.5A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 6 2.5c0 4-6 8-6 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  learn: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4.5L8 2L14 4.5L8 7L2 4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 5.5V10.5C4 10.5 6 12 8 12C10 12 12 10.5 12 10.5V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  visit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1C5 1 3 3 3 6C3 9.5 8 15 8 15S13 9.5 13 6C13 3 11 1 8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  acknowledge: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 8H14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5C9.7 3.7 10.5 5.7 10.5 8S9.7 12.3 8 14.5C6.3 12.3 5.5 10.3 5.5 8S6.3 3.7 8 1.5Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  advocate: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 6H8V3L13 8L8 13V10H3V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
};

export default function CivicActionPanel() {
  const [activeId, setActiveId] = useState(civicActions.categories[0].id);
  const active = civicActions.categories.find((c) => c.id === activeId) || civicActions.categories[0];

  return (
    <section className="civic-panel" aria-labelledby="civic-panel-heading">
      <div className="civic-panel-opener">
        <div className="civic-panel-eyebrow">What You Can Do · ᎠᏎᏄᏂ ᎦᏁᎦ</div>
        <h3 id="civic-panel-heading" className="civic-panel-heading">
          If this mattered to you, the living present needs you more than the past.
        </h3>
        <p className="civic-panel-intro">{civicActions._meta.opener}</p>
      </div>

      <div className="civic-panel-tabs" role="tablist">
        {civicActions.categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={cat.id === activeId}
            className={`civic-tab ${cat.id === activeId ? 'civic-tab--active' : ''}`}
            onClick={() => setActiveId(cat.id)}
          >
            <span className="civic-tab-icon" aria-hidden="true">
              {CATEGORY_ICONS[cat.id]}
            </span>
            <span className="civic-tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`civic-tab-${active.id}`}
        className="civic-panel-content"
        key={active.id}
      >
        <p className="civic-panel-content-intro">{active.intro}</p>
        <ul className="civic-action-list">
          {active.actions.map((action, i) => (
            <li key={i} className="civic-action">
              <div className="civic-action-header">
                <h4 className="civic-action-title">{action.title}</h4>
                {action.tagline && (
                  <div className="civic-action-tagline">{action.tagline}</div>
                )}
              </div>
              {action.description && (
                <p className="civic-action-description">{action.description}</p>
              )}
              <div className="civic-action-ctas">
                <a
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="civic-action-cta"
                >
                  {action.cta || 'Visit'}
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                {action.secondaryUrl && (
                  <a
                    href={action.secondaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="civic-action-cta civic-action-cta--secondary"
                  >
                    Android
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="civic-panel-footer">
        <p className="civic-panel-policy">
          <strong>Policy:</strong> {civicActions._meta.policy}
        </p>
      </div>
    </section>
  );
}
