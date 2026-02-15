/**
 * Компонент загрузчика (спиннера)
 * 
 * Простой анимированный индикатор загрузки
 * 
 * Пропсы:
 * - size: 'sm' | 'md' | 'lg' - размер спиннера
 */

import React from 'react';
import './Spinner.css';

export function Spinner({ size = 'md' }) {
  return (
    <div className={`spinner spinner-${size}`}>
      <div className="spinner-circle"></div>
    </div>
  );
}
