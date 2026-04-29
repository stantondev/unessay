import { useEffect, useRef, useState } from 'react';
import pronunciations from '../../data/pronunciations.json';
import './CherokeeVoiceCard.css';

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function CherokeeVoiceCard() {
  const audioRef = useRef(null);
  const [state, setState] = useState({ playing: false, progress: 0, duration: 0 });
  const src = pronunciations._meta?.audioSources?.wikitonguesJerryWolf;
  if (!src) return null;
  const audioUrl = BASE_URL + src.file;

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    function onTime() {
      setState((s) => ({ ...s, progress: a.currentTime, duration: a.duration || 0 }));
    }
    function onEnd() { setState((s) => ({ ...s, playing: false })); }
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onTime);
    a.addEventListener('ended', onEnd);
    a.addEventListener('pause', () => setState((s) => ({ ...s, playing: false })));
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onTime);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setState((s) => ({ ...s, playing: true }))).catch(() => {});
    } else {
      a.pause();
    }
  }

  function seek(e) {
    const a = audioRef.current;
    if (!a || !state.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = Math.max(0, Math.min(state.duration, pct * state.duration));
  }

  function fmt(t) {
    if (!t || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const pct = state.duration ? (state.progress / state.duration) * 100 : 0;

  return (
    <div className="voice-card">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="voice-card-eyebrow">
        <span className="voice-card-dot" aria-hidden="true" />
        Listen to the language
      </div>

      <div className="voice-card-body">
        <button
          type="button"
          className={`voice-card-play ${state.playing ? 'voice-card-play--playing' : ''}`}
          onClick={toggle}
          aria-label={state.playing ? 'Pause' : 'Play'}
        >
          {state.playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="3.5" height="10" fill="currentColor" /><rect x="8.5" y="2" width="3.5" height="10" fill="currentColor" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2L12 7L3 12Z" fill="currentColor" /></svg>
          )}
        </button>

        <div className="voice-card-meta">
          <div className="voice-card-name">
            Jerry Wolf — <span className="voice-card-name-sub">ᏣᎳᎩ</span>
          </div>
          <div className="voice-card-desc">
            Eastern Band of Cherokee Indians elder, speaking in the middle dialect
          </div>
        </div>
      </div>

      <div
        className="voice-card-bar"
        onClick={seek}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="voice-card-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="voice-card-times">
        <span>{fmt(state.progress)}</span>
        <span>{fmt(state.duration)}</span>
      </div>

      <div className="voice-card-attribution">
        Recorded and published by{' '}
        <a href="https://wikitongues.org" target="_blank" rel="noopener noreferrer">Wikitongues</a>.
        Licensed {src.license}.
      </div>
    </div>
  );
}
