import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import pronunciations from '../../data/pronunciations.json';
import './CherokeeWord.css';

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
function resolveAudio(src) {
  if (!src) return src;
  if (/^https?:/.test(src)) return src;
  return BASE_URL + src;
}

const WORDS = pronunciations.words;

/**
 * CherokeeWord — inline wrapper for any Cherokee word in the app.
 *
 * Shows the displayed word with a small speaker icon. Clicking the icon
 * opens a floating popover with pronunciation info: IPA, plain-English
 * guide, syllabary, English meaning, and optional audio playback.
 *
 * Usage:
 *   <CherokeeWord word="kituwah">Kituwah</CherokeeWord>
 *   <CherokeeWord word="kituwah" showSyllabary />
 *   <CherokeeWord word="kituwah" display="ᎩᏚᏩ" />
 */
export default function CherokeeWord({
  word,
  display,
  showSyllabary,
  children,
  inline = true,
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const buttonRef = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    function onClickOutside(e) {
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (e.target.closest('.cw-popover')) return;
      setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const data = WORDS[word];
  if (!data) {
    // Gracefully degrade: if we don't have pronunciation data, render plain
    return <span className={inline ? 'cw-inline' : undefined}>{children || display || word}</span>;
  }

  const displayText = children || display || data.syllabary || data.romanization || word;

  function toggleOpen() {
    if (!open) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setAnchor({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(!open);
  }

  function playAudio() {
    const sourceFile = data.audio || pronunciations._meta?.audioSources?.wikitonguesJerryWolf?.file;
    if (!sourceFile) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(resolveAudio(sourceFile));
      audioRef.current.addEventListener('ended', () => setPlaying(false));
      audioRef.current.addEventListener('pause', () => setPlaying(false));
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlaying(false);
  }

  return (
    <span className={`cw-wrap ${inline ? 'cw-inline' : ''}`}>
      <span className="cw-display">
        {displayText}
        {showSyllabary && data.syllabary && data.syllabary !== displayText && (
          <span className="cw-syllabary-inline">{data.syllabary}</span>
        )}
      </span>
      <button
        ref={buttonRef}
        type="button"
        className={`cw-button ${open ? 'cw-button--active' : ''}`}
        onClick={toggleOpen}
        aria-label={`Pronunciation of ${data.romanization || word}`}
        aria-expanded={open}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M3 4.5H5L7.5 2V10L5 7.5H3V4.5Z"
            fill="currentColor"
          />
          <path
            d="M9.2 3.8A3 3 0 0 1 9.2 8.2"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M10.5 2.5A5 5 0 0 1 10.5 9.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </button>

      {open && anchor && createPortal(
        <div
          className="cw-popover"
          style={{ top: anchor.top, left: anchor.left }}
          role="dialog"
          aria-label={`Pronunciation details for ${data.romanization || word}`}
        >
          <div className="cw-popover-arrow" aria-hidden="true" />
          <button
            type="button"
            className="cw-popover-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >×</button>

          {data.syllabary && (
            <div className="cw-popover-syllabary">{data.syllabary}</div>
          )}
          <div className="cw-popover-rom">{data.romanization || word}</div>
          {data.english && <div className="cw-popover-english">{data.english}</div>}

          <div className="cw-popover-phon">
            <div className="cw-popover-plain">
              <span className="cw-popover-label">Say it</span>
              <span className="cw-popover-plain-value">{data.plain || '—'}</span>
            </div>
            {data.ipa && (
              <div className="cw-popover-ipa">
                <span className="cw-popover-label">IPA</span>
                <span className="cw-popover-ipa-value">{data.ipa}</span>
              </div>
            )}
          </div>

          {data.note && <p className="cw-popover-note">{data.note}</p>}

          <div className="cw-popover-audio-row">
            <button
              type="button"
              className={`cw-popover-audio ${playing ? 'cw-popover-audio--playing' : ''}`}
              onClick={playing ? stopAudio : playAudio}
            >
              {playing ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="3" height="8" fill="currentColor" /><rect x="6" y="1" width="3" height="8" fill="currentColor" /></svg>
                  Stop
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 1L9 5L2 9Z" fill="currentColor" /></svg>
                  {data.audio ? 'Hear this word' : 'Hear the language'}
                </>
              )}
            </button>
            {!data.audio && (
              <span className="cw-popover-audio-note">
                Wikitongues recording of Cherokee by Jerry Wolf (Eastern Band elder)
              </span>
            )}
          </div>

          <div className="cw-popover-footer">
            Pronunciation guidance adapted from Durbin Feeling&apos;s <em>Cherokee-English Dictionary</em>.
            For the definitive word-level pronunciation, consult the{' '}
            <a
              href="https://language.cherokee.org/"
              target="_blank"
              rel="noopener noreferrer"
            >Cherokee Nation Language Department</a>.
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
