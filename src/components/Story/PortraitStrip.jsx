import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import portraitsData from '../../data/portraits.json';
import pronunciations from '../../data/pronunciations.json';
import CherokeeWord from './CherokeeWord';
import './PortraitStrip.css';

// Map a portrait id to a pronunciation key if one exists.
// Some portrait ids already match pronunciation keys (sequoyah, junaluska);
// others need translation to the *-name variant used in pronunciations.json.
const PRONUNCIATION_MAP = {
  'sequoyah': 'sequoyah',
  'john-ross': 'john-ross',
  'major-ridge': 'major-ridge-name',
  'john-ridge': 'john-ridge-name',
  'elias-boudinot': 'elias-boudinot-name',
  'stand-watie': 'stand-watie-name',
  'attakullakulla': 'attakullakulla',
  'junaluska': 'junaluska',
  'wilma-mankiller': 'wilma-mankiller-name',
};

function pronunciationIdFor(portraitId) {
  if (PRONUNCIATION_MAP[portraitId] && pronunciations.words[PRONUNCIATION_MAP[portraitId]]) {
    return PRONUNCIATION_MAP[portraitId];
  }
  return null;
}

const PORTRAITS_BY_ID = {};
for (const p of portraitsData.portraits) {
  PORTRAITS_BY_ID[p.id] = p;
}

// Respect Vite's configured base URL (the app is served from /unessay/ in production)
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
function resolveImage(src) {
  if (!src) return src;
  if (/^https?:/.test(src)) return src;
  return BASE_URL + src;
}

function stripHtml(s) {
  if (!s) return '';
  return String(s).replace(/<[^>]+>/g, '').trim();
}

export default function PortraitStrip({ ids }) {
  const [expandedId, setExpandedId] = useState(null);

  // Close lightbox on Escape
  useEffect(() => {
    if (!expandedId) return;
    function onKey(e) {
      if (e.key === 'Escape') setExpandedId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expandedId]);

  if (!ids || ids.length === 0) return null;
  const portraits = ids.map((id) => PORTRAITS_BY_ID[id]).filter(Boolean);
  if (portraits.length === 0) return null;

  const expanded = expandedId ? PORTRAITS_BY_ID[expandedId] : null;

  return (
    <>
      <div className={`portrait-strip portrait-strip--${portraits.length > 2 ? 'grid' : 'row'}`}>
        {portraits.map((p) => (
          <button
            key={p.id}
            type="button"
            className="portrait-card"
            onClick={() => setExpandedId(p.id)}
            aria-label={`View larger portrait of ${p.name}`}
          >
            <div className="portrait-frame">
              <img
                src={resolveImage(p.image)}
                alt={`Portrait of ${p.name}`}
                loading="lazy"
              />
            </div>
            <div className="portrait-meta">
              <div className="portrait-name">
                {p.name}
                {p.syllabary && <span className="portrait-syllabary">{p.syllabary}</span>}
              </div>
              {p.dates && <div className="portrait-dates">{p.dates}</div>}
              {p.role && <div className="portrait-role">{p.role}</div>}
            </div>
          </button>
        ))}
      </div>

      {expanded && createPortal(
        <div
          className="portrait-lightbox"
          onClick={() => setExpandedId(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Portrait of ${expanded.name}`}
        >
          <div className="portrait-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="portrait-lightbox-close"
              onClick={() => setExpandedId(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="portrait-lightbox-image">
              <img src={resolveImage(expanded.image)} alt={`Portrait of ${expanded.name}`} />
            </div>
            <div className="portrait-lightbox-body">
              <h3 className="portrait-lightbox-name">
                {expanded.name}
                {expanded.syllabary && (
                  <span className="portrait-lightbox-syllabary"> · {expanded.syllabary}</span>
                )}
                {pronunciationIdFor(expanded.id) && (
                  <span className="portrait-lightbox-pron">
                    <CherokeeWord word={pronunciationIdFor(expanded.id)} inline={false}>
                      <span className="portrait-lightbox-pron-badge">hear</span>
                    </CherokeeWord>
                  </span>
                )}
              </h3>
              {expanded.aka && <p className="portrait-lightbox-aka">{expanded.aka}</p>}
              {expanded.dates && <p className="portrait-lightbox-dates">{expanded.dates}</p>}
              {expanded.role && <p className="portrait-lightbox-role">{expanded.role}</p>}
              {expanded.notes && <p className="portrait-lightbox-notes">{expanded.notes}</p>}
              <div className="portrait-lightbox-attribution">
                <div>
                  <strong>Artist:</strong> {stripHtml(expanded.artist) || 'Unknown'}
                </div>
                {expanded.collection && (
                  <div>
                    <strong>Collection:</strong> {expanded.collection}
                  </div>
                )}
                <div>
                  <strong>License:</strong> {expanded.license}
                </div>
                {expanded.sourceUrl && (
                  <div>
                    <a
                      href={expanded.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portrait-lightbox-source"
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
