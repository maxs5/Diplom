import React from 'react';
import { Spinner } from '../ui/Spinner.jsx';
import './Loader.css';

export function Loader({ text = 'Загрузка...', fullScreen = false, size = 'lg' }) {
  return (
    <div className={`loader ${fullScreen ? 'loader-fullscreen' : ''}`}>
      <Spinner size={size} />
      <span className="loader-text">{text}</span>
    </div>
  );
}
