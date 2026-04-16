import { useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { SCENES, CHAPTERS } from '../../data/scenes';
import './AppHeader.css';

// For each chapter, find the first scene index that belongs to it
const CHAPTER_ENTRIES = Object.values(CHAPTERS).map((chapter) => {
  const firstSceneIndex = SCENES.findIndex((s) => s.chapter === chapter);
  return { chapter, firstSceneIndex };
});

export default function AppHeader() {
  const { state, dispatch } = useApp();

  const goToChapter = useCallback((sceneIndex) => {
    if (sceneIndex < 0) return;
    dispatch({ type: 'SET_SCENE_INDEX', payload: sceneIndex });
  }, [dispatch]);

  const currentChapter = SCENES[state.currentSceneIndex]?.chapter;

  return (
    <header className="app-header">
      <div className="app-header-title">
        <h1>What Was Here Before</h1>
        <div className="app-header-subtitle">A Cherokee history</div>
      </div>

      <nav className="app-header-nav">
        {CHAPTER_ENTRIES.map(({ chapter, firstSceneIndex }) => (
          <button
            key={chapter}
            className={`chapter-btn ${currentChapter === chapter ? 'is-active' : ''}`}
            onClick={() => goToChapter(firstSceneIndex)}
          >
            {chapter}
          </button>
        ))}
      </nav>

      <div className="app-header-actions">
        <button
          className="header-action-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SOURCES' })}
        >
          Sources
        </button>
      </div>
    </header>
  );
}
