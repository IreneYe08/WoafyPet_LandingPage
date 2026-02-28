import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/index.css'; // 你项目实际的全局 css 路径
import AppShell from '@/shell/AppShell';

console.log('GA ID =', import.meta.env.VITE_GA_MEASUREMENT_ID);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </React.StrictMode>
);