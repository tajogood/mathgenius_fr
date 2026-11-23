import React from 'react';
import {createRoot} from 'react-dom/client';
import FreeSite from './free/FreeSite.tsx';
import './styles.css';
import './styles/interactive.css';
import './styles/standards.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><FreeSite/></React.StrictMode>,
);
