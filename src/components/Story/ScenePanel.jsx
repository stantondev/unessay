import { useApp } from '../../context/AppContext';
import { SCENES } from '../../data/scenes';
import AnimatedCounter from './AnimatedCounter';
import './ScenePanel.css';

export default function ScenePanel() {
  const { state } = useApp();
  const scene = SCENES[state.currentSceneIndex];
  if (!scene) return null;

  return (
    <aside className="scene-panel">
      <div key={scene.id} className="scene-panel-inner">
        {scene.eyebrow && <div className="sp-eyebrow">{scene.eyebrow}</div>}
        <div className="sp-year-hero">
          <div className="sp-year">{scene.year}</div>
          {scene.yearSubtitle && (
            <span className="sp-year-subtitle">{scene.yearSubtitle}</span>
          )}
        </div>
        <h2 className="sp-title">{scene.title}</h2>
        <p className="sp-narrative">{scene.narrative}</p>

        {scene.quote && (
          <blockquote className="sp-quote">
            <p className="sp-quote-text">&ldquo;{scene.quote.text}&rdquo;</p>
            <footer className="sp-quote-attribution">
              &mdash; {scene.quote.attribution}
              {scene.quote.source && <span className="sp-quote-source"> · {scene.quote.source}</span>}
            </footer>
          </blockquote>
        )}

        {scene.stats && (
          <div className="sp-stats">
            {scene.stats.population !== undefined && (
              <div className="sp-stat">
                <span className="sp-stat-label">Population</span>
                <AnimatedCounter value={scene.stats.population} active={true} className="sp-stat-value" />
              </div>
            )}
            {scene.stats.sqMiles !== undefined && (
              <div className="sp-stat">
                <span className="sp-stat-label">Territory (sq mi)</span>
                <AnimatedCounter
                  value={scene.stats.sqMiles}
                  active={true}
                  className={`sp-stat-value ${scene.stats.sqMiles === 0 ? 'sp-stat-value--gone' : ''}`}
                />
              </div>
            )}
            {scene.stats.lostPercent !== undefined && scene.stats.lostPercent > 0 && (
              <div className="sp-stat">
                <span className="sp-stat-label">Lost</span>
                <AnimatedCounter
                  value={scene.stats.lostPercent}
                  suffix="%"
                  active={true}
                  className="sp-stat-value sp-stat-value--loss"
                />
              </div>
            )}
            {scene.stats.note && <div className="sp-stat-note">{scene.stats.note}</div>}
          </div>
        )}

        {scene.removalStats && (
          <div className="sp-stats">
            <div className="sp-stat">
              <span className="sp-stat-label">Marching</span>
              <AnimatedCounter value={scene.removalStats.marching} active={true} className="sp-stat-value" />
            </div>
            <div className="sp-stat">
              <span className="sp-stat-label">Lost</span>
              <AnimatedCounter
                value={scene.removalStats.lostSoFar}
                active={true}
                prefix={scene.removalStats.lostSoFar > 0 ? '~' : ''}
                className="sp-stat-value sp-stat-value--death"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
