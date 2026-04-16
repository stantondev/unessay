import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Note: StrictMode intentionally disabled — Mapbox GL does not handle
// double-mount cleanly and aborts its first style load, leaving the canvas blank.
createRoot(document.getElementById('root')).render(<App />);
