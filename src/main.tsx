import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import { initAnalytics } from './lib/analytics';

const helmetContext = {};

// iOS Safari only applies :active (the touch press styles in index.css) once
// the page listens for touches; an empty passive listener is enough.
document.addEventListener('touchstart', () => {}, { passive: true });

// privacy-friendly visit counts (live site only; see lib/analytics.ts)
initAnalytics();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HelmetProvider context={helmetContext}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);