import {delayRender, continueRender, registerRoot} from 'remotion';
import {RemotionRoot} from './compositions/AuryeIVideo';

// Load Cinzel + Lora from Google Fonts before any frame renders
if (typeof document !== 'undefined') {
  const handle = delayRender('Chargement polices Cinzel + Lora');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;1,400;1,700&display=block';
  link.onload = () => {
    Promise.all([
      document.fonts.load('700 64px Cinzel'),
      document.fonts.load('italic 64px Lora'),
    ])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  };
  link.onerror = () => continueRender(handle);
  document.head.appendChild(link);
}

registerRoot(RemotionRoot);
