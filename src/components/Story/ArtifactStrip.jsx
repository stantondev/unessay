import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import artifactsData from '../../data/artifacts.json';
import './ArtifactStrip.css';

const ARTIFACTS_BY_ID = {};
for (const a of artifactsData.artifacts) {
  ARTIFACTS_BY_ID[a.id] = a;
}

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
function resolveImage(src) {
  if (!src) return src;
  if (/^https?:/.test(src)) return src;
  return BASE_URL + src;
}

// Kind → small badge label shown on each card
const KIND_LABEL = {
  newspaper: 'Newspaper',
  document: 'Document',
  manuscript: 'Manuscript',
  chart: 'Chart',
  photograph: 'Photograph',
};

export default function ArtifactStrip({ ids }) {
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!expandedId) return;
    function onKey(e) {
      if (e.key === 'Escape') setExpandedId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedId]);

  if (!ids || ids.length === 0) return null;
  const artifacts = ids.map((id) => ARTIFACTS_BY_ID[id]).filter(Boolean);
  if (artifacts.length === 0) return null;

  const expanded = expandedId ? ARTIFACTS_BY_ID[expandedId] : null;

  return (
    <>
      <div className="artifact-strip">
        <div className="artifact-strip-label">Primary Source</div>
        {artifacts.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`artifact-card artifact-card--${a.aspect || 'portrait'}`}
            onClick={() => setExpandedId(a.id)}
            aria-label={`View ${a.title}`}
          >
            <div className="artifact-frame">
              <img src={resolveImage(a.image)} alt={a.title} loading="lazy" />
              {a.kind && (
                <span className="artifact-kind-badge">{KIND_LABEL[a.kind] || a.kind}</span>
              )}
            </div>
            <div className="artifact-meta">
              <div className="artifact-title">{a.title}</div>
              {a.subtitle && <div className="artifact-subtitle">{a.subtitle}</div>}
            </div>
          </button>
        ))}
      </div>

      {expanded && createPortal(
        <div
          className="artifact-lightbox"
          onClick={() => setExpandedId(null)}
          role="dialog"
          aria-modal="true"
          aria-label={expanded.title}
        >
          <div className="artifact-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="artifact-lightbox-close"
              onClick={() => setExpandedId(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className={`artifact-lightbox-image artifact-lightbox-image--${expanded.aspect || 'portrait'}`}>
              <img src={resolveImage(expanded.image)} alt={expanded.title} />
            </div>
            <div className="artifact-lightbox-body">
              {expanded.kind && (
                <div className="artifact-lightbox-kind">
                  {KIND_LABEL[expanded.kind] || expanded.kind}
                  {expanded.year && <> · {expanded.year}</>}
                </div>
              )}
              <h3 className="artifact-lightbox-title">{expanded.title}</h3>
              {expanded.subtitle && (
                <p className="artifact-lightbox-subtitle">{expanded.subtitle}</p>
              )}
              {expanded.caption && (
                <p className="artifact-lightbox-caption">{expanded.caption}</p>
              )}
              <div className="artifact-lightbox-attribution">
                <div>
                  <strong>Source:</strong> {expanded.artist || 'Unknown'}
                </div>
                <div>
                  <strong>License:</strong> {expanded.license}
                </div>
                {expanded.sourceUrl && (
                  <div>
                    <a
                      href={expanded.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="artifact-lightbox-source"
                    >
                      View on Wikimedia Commons →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
