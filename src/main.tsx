import React from 'react';
import {createRoot} from 'react-dom/client';
import FreeSite from './free/FreeSite.tsx';
import './styles.css';
import './styles/interactive.css';
import './styles/standards.css';
import {startDomTranslation} from './i18n/domTranslate.ts';
import {isEn,loadEnglish} from './i18n/index.ts';

const root=document.getElementById('root')!;
function start(){
  createRoot(root).render(
    <React.StrictMode><FreeSite/></React.StrictMode>,
  );
  startDomTranslation(root);
}
// English visitors load the lesson dictionary first (falls back to Korean text if it fails).
if(isEn())loadEnglish().catch(()=>{}).finally(start);
else start();
