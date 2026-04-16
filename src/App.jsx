import { AppProvider } from './context/AppContext';
import MapView from './components/Map/MapView';
import ScenePanel from './components/Story/ScenePanel';
import SceneTimeline from './components/Story/SceneTimeline';
import SourcesPanel from './components/Sources/SourcesPanel';
import AppHeader from './components/Navigation/AppHeader';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <AppHeader />
        <div className="app-body">
          <MapView />
          <ScenePanel />
        </div>
        <SceneTimeline />
        <SourcesPanel />
      </div>
    </AppProvider>
  );
}
