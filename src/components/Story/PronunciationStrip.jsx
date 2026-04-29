import pronunciations from '../../data/pronunciations.json';
import CherokeeWord from './CherokeeWord';
import './PronunciationStrip.css';

const WORDS = pronunciations.words;

export default function PronunciationStrip({ ids }) {
  if (!ids || ids.length === 0) return null;
  const items = ids.map((id) => [id, WORDS[id]]).filter(([, w]) => w);
  if (items.length === 0) return null;

  return (
    <div className="pron-strip">
      <div className="pron-strip-header">
        <span className="pron-strip-title">ᏣᎳᎩ Voices</span>
        <span className="pron-strip-sub">Tap to hear or read the pronunciation</span>
      </div>
      <div className="pron-strip-chips">
        {items.map(([id, w]) => (
          <CherokeeWord key={id} word={id} inline={false}>
            <span className="pron-chip">
              {w.syllabary && <span className="pron-chip-syllabary">{w.syllabary}</span>}
              <span className="pron-chip-rom">{w.romanization}</span>
            </span>
          </CherokeeWord>
        ))}
      </div>
    </div>
  );
}
