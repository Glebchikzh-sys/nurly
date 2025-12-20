import './index.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppContextProvider } from './contexts/AppContext';
import { DebugErrorBoundary } from './components/DebugErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DebugErrorBoundary>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </DebugErrorBoundary>
  </React.StrictMode>
);