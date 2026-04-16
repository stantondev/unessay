import { useApp } from '../../context/AppContext';
import { VIEWS, VIEW_CONFIGS } from '../../utils/constants';
import './ViewTabs.css';

const tabs = [
  { id: VIEWS.BEFORE, label: 'The World Before', icon: '\u2302' },
  { id: VIEWS.TREATIES, label: 'Treaty by Treaty', icon: '\u2696' },
  { id: VIEWS.REMOVAL, label: 'The Trail of Tears', icon: '\u2794' },
  { id: VIEWS.TODAY, label: 'What Remains', icon: '\u2726' },
];

export default function ViewTabs() {
  const { state, dispatch } = useApp();

  return (
    <nav className="view-tabs">
      <div className="view-tabs-title">
        <h1>What Was Here Before</h1>
      </div>
      <div className="view-tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`view-tab ${state.activeView === tab.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: tab.id })}
          >
            <span className="view-tab-icon">{tab.icon}</span>
            <span className="view-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="view-tabs-actions">
        <button
          className={`tab-action ${state.personalStoryOpen ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_PERSONAL_STORY' })}
          title="A Family Thread — Personal narrative"
        >
          A Family Thread
        </button>
        <button
          className={`tab-action ${state.sourcesOpen ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_SOURCES' })}
          title="Sources & Bibliography"
        >
          Sources
        </button>
      </div>
    </nav>
  );
}
