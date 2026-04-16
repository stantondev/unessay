import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SCENES, CHAPTERS } from '../../data/scenes';
import './SceneTimeline.css';

// Smart auto-advance: pause length is calculated per scene based on its
// narrative length. Reading speed of ~280ms per word + 8s buffer for the
// quote/stats/visual appreciation. Minimum 18s, maximum 70s per scene.
const PER_WORD_MS = 280;
const READ_BUFFER_MS = 8000;
const MIN_SCENE_MS = 18000;
const MAX_SCENE_MS = 70000;

function sceneDurationMs(scene) {
  if (!scene) return MIN_SCENE_MS;
  const narrative = scene.narrative || '';
  const quote = scene.quote?.text || '';
  const wordCount = (narrative + ' ' + quote).trim().split(/\s+/).length;
  const calculated = wordCount * PER_WORD_MS + READ_BUFFER_MS;
  return Math.max(MIN_SCENE_MS, Math.min(MAX_SCENE_MS, calculated));
}

// Chapter colors for the progress bar segments
const CHAPTER_COLORS = {
  [CHAPTERS.BEFORE]: '#4ade80',
  [CHAPTERS.TREATIES]: '#fbbf24',
  [CHAPTERS.REMOVAL]: '#dc2626',
  [CHAPTERS.TODAY]: '#60a5fa',
};

// Precompute chapter segment positions (% of timeline width)
function computeChapterSegments() {
  const total = SCENES.length;
  const segments = [];
  let currentChapter = null;
  let start = 0;

  SCENES.forEach((scene, index) => {
    if (scene.chapter !== currentChapter) {
      if (currentChapter !== null) {
        segments.push({
          chapter: currentChapter,
          start: (start / (total - 1)) * 100,
          end: ((index - 1) / (total - 1)) * 100,
        });
      }
      currentChapter = scene.chapter;
      start = index;
    }
  });
  // Push the last segment
  segments.push({
    chapter: currentChapter,
    start: (start / (total - 1)) * 100,
    end: ((total - 1) / (total - 1)) * 100,
  });
  return segments;
}

const CHAPTER_SEGMENTS = computeChapterSegments();

export default function SceneTimeline() {
  const { state, dispatch } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  const totalScenes = SCENES.length;
  const currentIndex = state.currentSceneIndex;
  const progressPercent = (currentIndex / (totalScenes - 1)) * 100;

  const goToScene = useCallback((index) => {
    if (index < 0 || index >= totalScenes) return;
    dispatch({ type: 'SET_SCENE_INDEX', payload: index });
  }, [dispatch, totalScenes]);

  const stepForward = useCallback(() => {
    const next = Math.min(currentIndex + 1, totalScenes - 1);
    goToScene(next);
  }, [currentIndex, goToScene, totalScenes]);

  const stepBackward = useCallback(() => {
    const prev = Math.max(currentIndex - 1, 0);
    goToScene(prev);
  }, [currentIndex, goToScene]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Per-scene duration (smart timing based on narrative length)
  const currentSceneDurationMs = sceneDurationMs(SCENES[currentIndex]);

  // Auto-advance on play
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      return;
    }
    // If we're at the end, stop
    if (currentIndex >= totalScenes - 1) {
      setIsPlaying(false);
      return;
    }
    playTimerRef.current = setTimeout(() => {
      stepForward();
    }, currentSceneDurationMs);
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentIndex, totalScenes, stepForward, currentSceneDurationMs]);

  // Keyboard shortcuts: Space toggles play, arrows step
  useEffect(() => {
    const handler = (e) => {
      // Don't hijack keys when the user is typing in an input
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, stepForward, stepBackward]);

  const currentScene = SCENES[currentIndex];

  return (
    <div className="scene-timeline">
      <div className="scene-timeline-inner">
        {/* Transport controls */}
        <div className="scene-timeline-controls">
          <button
            className="tl-btn"
            onClick={stepBackward}
            disabled={currentIndex <= 0}
            title="Previous (Left arrow)"
            aria-label="Previous scene"
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <rect x="0" y="0" width="2" height="12" />
              <path d="M10 0L3 6L10 12z" />
            </svg>
          </button>
          <button
            className={`tl-btn tl-btn-play ${isPlaying ? 'is-playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            // CSS animation duration tied to the current scene's calculated pause
            style={{ '--scene-duration': `${currentSceneDurationMs}ms` }}
          >
            {/* Circular progress ring that fills as the scene plays */}
            {isPlaying && (
              <svg className="tl-play-ring" viewBox="0 0 40 40" key={currentIndex}>
                <circle cx="20" cy="20" r="18" />
              </svg>
            )}
            {isPlaying ? (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <rect x="0" y="0" width="3" height="12" />
                <rect x="7" y="0" width="3" height="12" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                <path d="M0 0L12 7L0 14z" />
              </svg>
            )}
          </button>
          <button
            className="tl-btn"
            onClick={stepForward}
            disabled={currentIndex >= totalScenes - 1}
            title="Next (Right arrow)"
            aria-label="Next scene"
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <path d="M0 0L7 6L0 12z" />
              <rect x="8" y="0" width="2" height="12" />
            </svg>
          </button>
        </div>

        {/* Current scene label */}
        <div className="scene-timeline-label">
          <div className="tl-label-year">{currentScene?.year}</div>
          <div className="tl-label-title">{currentScene?.title}</div>
        </div>

        {/* Progress + ticks */}
        <div className="scene-timeline-track-wrap">
          {/* Chapter backing segments */}
          <div className="scene-timeline-chapters">
            {CHAPTER_SEGMENTS.map((seg) => (
              <div
                key={seg.chapter}
                className="scene-timeline-chapter-seg"
                style={{
                  left: `${seg.start}%`,
                  width: `${seg.end - seg.start}%`,
                  background: CHAPTER_COLORS[seg.chapter],
                }}
                title={seg.chapter}
              >
                <span className="scene-timeline-chapter-label">{seg.chapter}</span>
              </div>
            ))}
          </div>

          {/* Track */}
          <div
            className="scene-timeline-track"
            style={{
              '--progress': `${progressPercent}%`,
            }}
          >
            {/* Filled progress bar */}
            <div className="scene-timeline-fill" />

            {/* Scene ticks */}
            {SCENES.map((scene, index) => {
              const pos = (index / (totalScenes - 1)) * 100;
              const isCurrent = index === currentIndex;
              const isPast = index < currentIndex;
              return (
                <button
                  key={scene.id}
                  className={`scene-timeline-tick ${isCurrent ? 'is-current' : ''} ${isPast ? 'is-past' : ''}`}
                  style={{ left: `${pos}%` }}
                  onClick={() => goToScene(index)}
                  title={`${scene.year} — ${scene.title}`}
                  aria-label={`Jump to ${scene.title}`}
                >
                  <span className="tl-tooltip">
                    <span className="tl-tooltip-year">{scene.year}</span>
                    <span className="tl-tooltip-title">{scene.title}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Counter */}
          <div className="scene-timeline-counter">
            {currentIndex + 1} / {totalScenes}
          </div>
        </div>
      </div>
    </div>
  );
}
