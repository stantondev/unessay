import { useEffect, useRef, useState } from 'react';
import oralHistories from '../../data/oralHistories.json';
import './OralHistoryCard.css';

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');

function resolveMedia(src) {
  if (!src) return src;
  if (/^https?:/.test(src)) return src;
  return BASE_URL + src;
}

function fmt(t) {
  if (!t || !isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * OralHistoryCard — renders a piece of first-person testimony with framing.
 *
 * Data lives in oralHistories.json. Some entries have playable media (audio
 * or video); some are text-only. Either way, the card gives the testimony
 * room to breathe with speaker, date, context, transcript/quote, and source.
 */
export default function OralHistoryCard({ id, mode = 'full' }) {
  const h = oralHistories.histories[id];
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [state, setState] = useState({ playing: false, progress: 0, duration: 0 });
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const media = h?.mediaAvailable && h.mediaKind === 'audio' ? audioRef : videoRef;

  useEffect(() => {
    if (!h?.mediaAvailable) return;
    const el = media.current;
    if (!el) return;
    function onTime() {
      setState((s) => ({ ...s, progress: el.currentTime, duration: el.duration || 0 }));
    }
    function onEnd() { setState((s) => ({ ...s, playing: false })); }
    function onPause() { setState((s) => ({ ...s, playing: false })); }
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onTime);
    el.addEventListener('ended', onEnd);
    el.addEventListener('pause', onPause);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onTime);
      el.removeEventListener('ended', onEnd);
      el.removeEventListener('pause', onPause);
    };
  }, [h?.mediaAvailable, h?.mediaKind]);

  if (!h) return null;

  function toggle() {
    const el = media.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setState((s) => ({ ...s, playing: true }))).catch(() => {});
    } else {
      el.pause();
    }
  }

  function seek(e) {
    const el = media.current;
    if (!el || !state.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.currentTime = Math.max(0, Math.min(state.duration, pct * state.duration));
  }

  const pct = state.duration ? (state.progress / state.duration) * 100 : 0;
  const hasMedia = h.mediaAvailable;
  const isVideo = hasMedia && h.mediaKind === 'video';
  const isAudio = hasMedia && h.mediaKind === 'audio';

  return (
    <div className={`oral-card oral-card--${h.recordingMedium}`}>
      <div className="oral-card-header">
        <div className="oral-card-eyebrow">
          <span className="oral-card-kind-badge">
            {hasMedia ? (isVideo ? 'Video Testimony' : 'Audio Recording') : 'Archival Testimony'}
          </span>
          <span className="oral-card-date">{h.date}</span>
        </div>
        <div className="oral-card-speaker">
          <div className="oral-card-speaker-name">{h.speaker}</div>
          <div className="oral-card-speaker-role">{h.speakerRole}</div>
        </div>
      </div>

      {hasMedia && isAudio && (
        <div className="oral-card-audio">
          <audio ref={audioRef} src={resolveMedia(h.mediaFile)} preload="metadata" />
          <button
            type="button"
            className={`oral-card-play ${state.playing ? 'oral-card-play--playing' : ''}`}
            onClick={toggle}
            aria-label={state.playing ? 'Pause recording' : 'Play recording'}
          >
            {state.playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2L13 8L4 14Z" fill="currentColor" /></svg>
            )}
          </button>
          <div className="oral-card-audio-track">
            <div className="oral-card-bar" onClick={seek} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div className="oral-card-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="oral-card-times">
              <span>{fmt(state.progress)}</span>
              <span>{fmt(state.duration)}</span>
            </div>
          </div>
        </div>
      )}

      {hasMedia && isVideo && (
        <div className="oral-card-video">
          <video
            ref={videoRef}
            src={resolveMedia(h.mediaFile)}
            preload="metadata"
            controls
            playsInline
            onPlay={() => setState((s) => ({ ...s, playing: true }))}
          />
        </div>
      )}

      {h.quote && (
        <blockquote className="oral-card-quote">
          <p className="oral-card-quote-text">&ldquo;{h.shortQuote || h.quote}&rdquo;</p>
          <footer className="oral-card-quote-footer">
            — {h.attribution}
          </footer>
        </blockquote>
      )}

      {h.context && <p className="oral-card-context">{h.context}</p>}

      {(h.transcript || h.dateContext) && (
        <button
          type="button"
          className="oral-card-expand"
          onClick={() => setTranscriptOpen(!transcriptOpen)}
          aria-expanded={transcriptOpen}
        >
          {transcriptOpen ? 'Hide details' : 'More context & full transcript'}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{ transform: transcriptOpen ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.3" fill="none" />
          </svg>
        </button>
      )}

      {transcriptOpen && (
        <div className="oral-card-details">
          {h.dateContext && (
            <div className="oral-card-detail-block">
              <div className="oral-card-detail-label">Recording context</div>
              <p className="oral-card-detail-text">{h.dateContext}</p>
            </div>
          )}
          {h.quote && h.shortQuote && h.quote !== h.shortQuote && (
            <div className="oral-card-detail-block">
              <div className="oral-card-detail-label">Full quote</div>
              <p className="oral-card-detail-text">&ldquo;{h.quote}&rdquo;</p>
            </div>
          )}
          {h.transcript && (
            <div className="oral-card-detail-block">
              <div className="oral-card-detail-label">About this recording</div>
              <p className="oral-card-detail-text">{h.transcript}</p>
            </div>
          )}
        </div>
      )}

      <div className="oral-card-source">
        <strong>Source:</strong> {h.source || h.attribution}
        {h.license && <> · <strong>License:</strong> {h.license}</>}
        {h.sourceUrl && (
          <> · <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer">View archival record →</a></>
        )}
      </div>
    </div>
  );
}
