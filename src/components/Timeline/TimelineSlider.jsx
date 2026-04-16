import { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { VIEWS } from '../../utils/constants';
import treaties from '../../data/treaties.json';
import './TimelineSlider.css';

// Removal frames come after the 10 treaty stages
export const REMOVAL_FRAMES = [
  {
    id: 'removal-roundup',
    date: 'May–June 1838',
    year: '1838',
    name: 'The Roundup',
    detail: '~16,000 Cherokee forced from homes into internment camps at 31 forts.',
    marching: 16000,
    deaths: 0,
    lostSoFar: 0,
  },
  {
    id: 'removal-departure',
    date: 'October 1838',
    year: '1838',
    name: 'Departure',
    detail: 'Detachments begin the march west from Fort Cass and Ross\u2019s Landing.',
    marching: 16000,
    deaths: 0,
    lostSoFar: 0,
  },
  {
    id: 'removal-tennessee',
    date: 'November 1838',
    year: '1838',
    name: 'Crossing Tennessee',
    detail: 'Detachments stretch across Tennessee and Kentucky in freezing weather.',
    marching: 15200,
    deaths: 800,
    lostSoFar: 800,
  },
  {
    id: 'removal-mississippi',
    date: 'Winter 1838–39',
    year: '1839',
    name: 'The Frozen Rivers',
    detail: 'The Ohio and Mississippi freeze. Detachments trapped for weeks. Mass deaths from disease and exposure.',
    marching: 13800,
    deaths: 2200,
    lostSoFar: 2200,
  },
  {
    id: 'removal-arkansas',
    date: 'February 1839',
    year: '1839',
    name: 'Crossing Arkansas',
    detail: 'Survivors push through Arkansas. Quatie Ross dies near Little Rock.',
    marching: 12500,
    deaths: 3500,
    lostSoFar: 3500,
  },
  {
    id: 'removal-arrival',
    date: 'March 1839',
    year: '1839',
    name: 'Arrival in Indian Territory',
    detail: 'Survivors arrive at Tahlequah in present-day Oklahoma. Approximately 4,000 died — 1 in 4.',
    marching: 12000,
    deaths: 4000,
    lostSoFar: 4000,
  },
];

const totalStages = treaties.length + REMOVAL_FRAMES.length;

// Year labels to show underneath the slider track
const YEAR_LABELS = [
  { year: '1721', index: 0 },
  { year: '1777', index: 1 },
  { year: '1785', index: 3 },
  { year: '1791', index: 4 },
  { year: '1798', index: 5 },
  { year: '1806', index: 6 },
  { year: '1814', index: 7 },
  { year: '1819', index: 8 },
  { year: '1835', index: 9 },
  { year: '1838', index: 10 },
  { year: '1839', index: 15 },
];

export default function TimelineSlider() {
  const { state, dispatch } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);
  const indexRef = useRef(state.selectedTreatyIndex);

  // Keep ref in sync
  indexRef.current = state.selectedTreatyIndex;

  const handleSliderChange = useCallback((e) => {
    dispatch({ type: 'SET_TREATY_INDEX', payload: parseInt(e.target.value, 10) });
  }, [dispatch]);

  const stepForward = useCallback(() => {
    const next = Math.min(indexRef.current + 1, totalStages - 1);
    dispatch({ type: 'SET_TREATY_INDEX', payload: next });
  }, [dispatch]);

  const stepBackward = useCallback(() => {
    const prev = Math.max(indexRef.current - 1, 0);
    dispatch({ type: 'SET_TREATY_INDEX', payload: prev });
  }, [dispatch]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Auto-play interval — slower during removal frames to let the animation breathe
  useEffect(() => {
    if (isPlaying && state.activeView === VIEWS.TREATIES) {
      const tick = () => {
        if (indexRef.current >= totalStages - 1) {
          setIsPlaying(false);
          clearInterval(playIntervalRef.current);
          return;
        }
        stepForward();
      };
      // Slower cadence during removal frames so the migration is readable
      const interval = indexRef.current >= treaties.length - 1 ? 3200 : 2500;
      playIntervalRef.current = setInterval(tick, interval);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, state.activeView, stepForward, state.selectedTreatyIndex]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      if (state.activeView !== VIEWS.TREATIES) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.activeView, stepForward, stepBackward, togglePlay]);

  // Don't render if not in treaties view
  if (state.activeView !== VIEWS.TREATIES) return null;

  const idx = state.selectedTreatyIndex;
  const isRemovalFrame = idx >= treaties.length;
  const progressPercent = (idx / (totalStages - 1)) * 100;

  // Render different info based on phase
  let dateText, nameText, statLeftLabel, statLeftValue, statMidLabel, statMidValue, statRightLabel, statRightValue;

  if (isRemovalFrame) {
    const frame = REMOVAL_FRAMES[idx - treaties.length];
    dateText = frame.date;
    nameText = frame.name;
    statLeftLabel = 'Marching';
    statLeftValue = `${frame.marching.toLocaleString()}`;
    statMidLabel = 'Lost';
    statMidValue = frame.lostSoFar > 0 ? `~${frame.lostSoFar.toLocaleString()}` : '0';
    statRightLabel = 'Stage';
    statRightValue = `${idx + 1} / ${totalStages}`;
  } else {
    const treaty = treaties[idx];
    const originalSqMi = 40000;
    const remainingSqMi = treaty.sqMilesRemaining;
    const lostPercent = ((originalSqMi - remainingSqMi) / originalSqMi * 100).toFixed(0);
    dateText = treaty.date;
    nameText = treaty.name;
    statLeftLabel = 'Remaining';
    statLeftValue = remainingSqMi > 0 ? `~${remainingSqMi.toLocaleString()} sq mi` : 'None';
    statMidLabel = 'Lost';
    statMidValue = `${lostPercent}%`;
    statRightLabel = 'Stage';
    statRightValue = `${idx + 1} / ${totalStages}`;
  }

  return (
    <div className={`timeline-slider ${isRemovalFrame ? 'timeline-slider--removal' : ''}`}>
      <div className="timeline-info">
        <div className="timeline-treaty-name">
          <span className="timeline-date">{dateText}</span>
          <span className="timeline-name">{nameText}</span>
        </div>
        <div className="timeline-stats">
          <div className="timeline-stat">
            <span className="stat-label">{statLeftLabel}</span>
            <span className="stat-value">{statLeftValue}</span>
          </div>
          <div className="timeline-stat-divider" />
          <div className="timeline-stat">
            <span className="stat-label">{statMidLabel}</span>
            <span className={`stat-value ${isRemovalFrame ? 'stat-death' : 'stat-loss'}`}>{statMidValue}</span>
          </div>
          <div className="timeline-stat-divider" />
          <div className="timeline-stat">
            <span className="stat-label">{statRightLabel}</span>
            <span className="stat-value">{statRightValue}</span>
          </div>
        </div>
      </div>

      <div className="timeline-controls">
        <div className="timeline-buttons">
          <button onClick={stepBackward} disabled={idx <= 0} className="timeline-btn" title="Previous (Left arrow)">
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              <rect x="0" y="0" width="1.5" height="10" />
              <path d="M8 0L2 5L8 10z" />
            </svg>
          </button>
          <button onClick={togglePlay} className="timeline-btn play-btn" title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
            {isPlaying ? (
              <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
                <rect x="0" y="0" width="2.5" height="10" />
                <rect x="5.5" y="0" width="2.5" height="10" />
              </svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <path d="M0 0L10 6L0 12z" />
              </svg>
            )}
          </button>
          <button onClick={stepForward} disabled={idx >= totalStages - 1} className="timeline-btn" title="Next (Right arrow)">
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              <path d="M0 0L6 5L0 10z" />
              <rect x="6.5" y="0" width="1.5" height="10" />
            </svg>
          </button>
        </div>

        <div className="timeline-track-wrapper">
          <div className="timeline-years">
            {YEAR_LABELS.map(({ year, index }) => (
              <span
                key={`${year}-${index}`}
                className={`timeline-year ${index === idx ? 'active' : ''} ${index >= treaties.length ? 'removal-year' : ''}`}
                style={{ left: `${(index / (totalStages - 1)) * 100}%` }}
              >
                {year}
              </span>
            ))}
          </div>

          <input
            type="range"
            min={0}
            max={totalStages - 1}
            step={1}
            value={idx}
            onChange={handleSliderChange}
            className="timeline-range"
            style={{
              '--progress': `${progressPercent}%`,
              '--treaty-end': `${((treaties.length - 1) / (totalStages - 1)) * 100}%`,
            }}
          />

          <div className="timeline-help">
            <span>1721</span>
            <span>{isPlaying ? 'Space to pause' : 'Arrow keys to navigate \u00b7 Space to play'}</span>
            <span>1839</span>
          </div>
        </div>
      </div>
    </div>
  );
}
