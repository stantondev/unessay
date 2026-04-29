import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TIMELAPSE_STAGES } from '../../data/timelapseStages';
import './TerritoryTimelapse.css';

const STAGE_MS = 1650; // per stage dwell time; ~15 seconds total for 9 stages

export default function TerritoryTimelapse() {
  const { state, dispatch } = useApp();
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const lastStageRef = useRef(-1);
  // Capture the scene index at the moment the time-lapse starts, so we can
  // detect the user navigating to a different scene (via the bottom timeline,
  // chapter tabs, scene chips, or autoplay) and auto-dismiss the overlay.
  const sceneAtStartRef = useRef(null);

  // Animation loop: advance stages at STAGE_MS intervals. Critically, this
  // effect depends ONLY on `timelapseActive` (not on `timelapseStage`) — the
  // tick function reads the expected stage from elapsed time and dispatches
  // only when it changes. Including `timelapseStage` in deps would cancel and
  // restart the RAF on every advance, re-pinning the start time to now.
  useEffect(() => {
    if (!state.timelapseActive) return;
    startRef.current = performance.now();
    lastStageRef.current = -1;
    // Remember which scene we started from so we can detect later navigation.
    sceneAtStartRef.current = state.currentSceneIndex;

    function tick(now) {
      const elapsed = now - startRef.current;
      const stage = Math.min(
        TIMELAPSE_STAGES.length - 1,
        Math.floor(elapsed / STAGE_MS)
      );
      if (stage !== lastStageRef.current) {
        lastStageRef.current = stage;
        dispatch({ type: 'SET_TIMELAPSE_STAGE', payload: stage });
      }
      if (stage < TIMELAPSE_STAGES.length - 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // sceneAtStartRef intentionally captured at start time only — re-running
    // this effect on every scene change would defeat the auto-dismiss logic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timelapseActive, dispatch]);

  // Auto-dismiss: if the user navigates to a different scene while the
  // time-lapse is showing (autoplay, scene timeline, prev/next, chapter tab),
  // stop the time-lapse so they're not stuck behind the overlay.
  useEffect(() => {
    if (!state.timelapseActive) return;
    if (sceneAtStartRef.current === null) return;
    if (state.currentSceneIndex !== sceneAtStartRef.current) {
      dispatch({ type: 'STOP_TIMELAPSE' });
    }
  }, [state.currentSceneIndex, state.timelapseActive, dispatch]);

  // ESC key dismisses the time-lapse — standard UX for modal-like overlays.
  useEffect(() => {
    if (!state.timelapseActive) return;
    function onKey(e) {
      if (e.key === 'Escape') dispatch({ type: 'STOP_TIMELAPSE' });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.timelapseActive, dispatch]);

  // Any click outside the time-lapse header (the visible year + stop button
  // box) dismisses the overlay. This catches clicks on the bottom scene
  // timeline (including the main story play button), the scene panel, the
  // app header — anything the user might press to "get back to the story."
  useEffect(() => {
    if (!state.timelapseActive) return;
    function onMouseDown(e) {
      const header = document.querySelector('.timelapse-header');
      if (header && header.contains(e.target)) return; // clicks inside the year/stop area do nothing
      // Clicking the trigger button while active is impossible (we render the
      // overlay instead), so any other click is a "get out of here" signal.
      dispatch({ type: 'STOP_TIMELAPSE' });
    }
    // Capture phase so we run before child handlers (e.g. SceneTimeline's
    // play button) have a chance to start their own work.
    window.addEventListener('mousedown', onMouseDown, true);
    return () => window.removeEventListener('mousedown', onMouseDown, true);
  }, [state.timelapseActive, dispatch]);

  function handleStart() {
    dispatch({ type: 'START_TIMELAPSE' });
  }

  function handleStop() {
    dispatch({ type: 'STOP_TIMELAPSE' });
  }

  if (!state.timelapseActive) {
    return (
      <button
        type="button"
        className="timelapse-trigger"
        onClick={handleStart}
        aria-label="Play 15-second territory time-lapse"
      >
        <span className="timelapse-trigger-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M3 2L11 7L3 12Z" fill="currentColor" />
          </svg>
        </span>
        <span className="timelapse-trigger-text">
          <span className="timelapse-trigger-title">Play the cessions</span>
          <span className="timelapse-trigger-sub">15-second time-lapse · 1700&ndash;1835</span>
        </span>
      </button>
    );
  }

  const stage = TIMELAPSE_STAGES[state.timelapseStage] || TIMELAPSE_STAGES[0];
  const progress = ((state.timelapseStage + 1) / TIMELAPSE_STAGES.length) * 100;

  return (
    <div className="timelapse-overlay" role="dialog" aria-modal="true" aria-labelledby="timelapse-heading">
      {/* Click-to-dismiss scrim covering the rest of the map below the header */}
      <button
        type="button"
        className="timelapse-scrim"
        aria-label="Dismiss time-lapse and return to story"
        onClick={handleStop}
      />
      <div className="timelapse-header">
        <div className="timelapse-year-hero">
          <span className="timelapse-year" id="timelapse-heading">{stage.year}</span>
          <span className="timelapse-divider" aria-hidden="true" />
          <span className="timelapse-stats">
            <span className="timelapse-stat">
              <span className="timelapse-stat-label">Territory</span>
              <span className="timelapse-stat-value">{stage.sqMiles.toLocaleString()} sq mi</span>
            </span>
            <span className="timelapse-stat">
              <span className="timelapse-stat-label">Lost</span>
              <span className={`timelapse-stat-value timelapse-stat-value--loss ${stage.percentLost === 100 ? 'timelapse-stat-value--all' : ''}`}>
                {stage.percentLost}%
              </span>
            </span>
          </span>
        </div>
        <div className="timelapse-event">{stage.event}</div>
        <div className="timelapse-progress" aria-hidden="true">
          <div className="timelapse-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="timelapse-progress-stages" aria-hidden="true">
          {TIMELAPSE_STAGES.map((s, i) => (
            <div
              key={s.key}
              className={`timelapse-stage-dot ${i <= state.timelapseStage ? 'timelapse-stage-dot--active' : ''}`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="timelapse-stop"
        onClick={handleStop}
        aria-label="Stop time-lapse"
      >
        {state.timelapseStage >= TIMELAPSE_STAGES.length - 1 ? 'Return to story' : 'Stop'}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
