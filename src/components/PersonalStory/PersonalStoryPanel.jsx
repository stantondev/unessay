import { useApp } from '../../context/AppContext';
import personalStory from '../../data/personalStory.json';
import './PersonalStoryPanel.css';

export default function PersonalStoryPanel() {
  const { state, dispatch } = useApp();

  if (!state.personalStoryOpen) return null;

  return (
    <div className="personal-overlay">
      <div className="personal-panel">
        <div className="personal-header">
          <div>
            <h2>{personalStory.title}</h2>
            <p className="personal-subtitle">{personalStory.subtitle}</p>
          </div>
          <button
            className="personal-close"
            onClick={() => dispatch({ type: 'TOGGLE_PERSONAL_STORY' })}
          >
            &times;
          </button>
        </div>
        <div className="personal-body">
          <p className="personal-intro">{personalStory.introduction}</p>

          {personalStory.sections.map((section) => (
            <div key={section.id} className="personal-section">
              <h3>{section.title}</h3>
              <p>{section.content}</p>
              {section.note && (
                <p className="personal-note">{section.note}</p>
              )}
            </div>
          ))}

          <div className="personal-section family-line">
            <h3>Family Line</h3>
            <p className="family-line-text">{personalStory.familyLine}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
