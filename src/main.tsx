import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MidnightProvider } from './hooks/useMidnight';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MidnightProvider>
      <App />
    </MidnightProvider>
  </React.StrictMode>,
);
