import { createContext, useContext, useReducer } from 'react';
import { VIEWS } from '../utils/constants';

const AppContext = createContext(null);

const initialState = {
  activeView: VIEWS.TREATIES,
  selectedTreatyIndex: 0,
  currentSceneIndex: 0,
  selectedItem: null,
  infoPanelOpen: false,
  layerVisibility: {
    towns: true,
    routes: true,
    forts: true,
    waypoints: true,
  },
  sourcesOpen: false,
  feedbackOpen: false,
  royceMapVisible: false,
  royceMapOpacity: 0.72,
  timelapseActive: false,
  timelapseStage: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload, selectedItem: null };
    case 'SET_TREATY_INDEX':
      return { ...state, selectedTreatyIndex: action.payload };
    case 'SET_SCENE_INDEX':
      return { ...state, currentSceneIndex: action.payload };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload, infoPanelOpen: true };
    case 'TOGGLE_INFO_PANEL':
      return { ...state, infoPanelOpen: !state.infoPanelOpen };
    case 'CLOSE_INFO_PANEL':
      return { ...state, infoPanelOpen: false };
    case 'TOGGLE_LAYER':
      return {
        ...state,
        layerVisibility: {
          ...state.layerVisibility,
          [action.payload]: !state.layerVisibility[action.payload],
        },
      };
    case 'TOGGLE_SOURCES':
      return { ...state, sourcesOpen: !state.sourcesOpen };
    case 'TOGGLE_FEEDBACK':
      return { ...state, feedbackOpen: !state.feedbackOpen };
    case 'TOGGLE_ROYCE_MAP':
      return { ...state, royceMapVisible: !state.royceMapVisible };
    case 'SET_ROYCE_OPACITY':
      return { ...state, royceMapOpacity: action.payload };
    case 'START_TIMELAPSE':
      return { ...state, timelapseActive: true, timelapseStage: 0 };
    case 'SET_TIMELAPSE_STAGE':
      return { ...state, timelapseStage: action.payload };
    case 'STOP_TIMELAPSE':
      return { ...state, timelapseActive: false, timelapseStage: 0 };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
