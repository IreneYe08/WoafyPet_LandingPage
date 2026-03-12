import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/index.css';
import AppShell from '@/shell/AppShell';

function getRouterBasename() {
  const raw = import.meta.env.VITE_BASE_PATH || '/WoafyPet_LandingPage/';
  if (raw === '/') return '/';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

const basename = getRouterBasename();

console.log('GA ID =', import.meta.env.VITE_GA_MEASUREMENT_ID);
console.log('BASE PATH =', import.meta.env.VITE_BASE_PATH);
console.log('ROUTER BASENAME =', basename);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AppShell />
    </BrowserRouter>
  </React.StrictMode>
);