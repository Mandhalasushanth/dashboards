import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/globals.css';
import '@/styles/accessibility.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root is missing from index.html.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
