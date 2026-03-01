/**
 * Компонент поля ввода
 * 
 * Простое текстовое поле с поддержкой разных типов
 * 
 * Пропсы:
 * - label: подпись к полю
 * - error: текст ошибки
 * - ...rest: остальные атрибуты input
 */

import React from 'react';
import './Input.css';

export function Input({ 
  label, 
  error,
  icon,
  className = '',
  ...props 
}) {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className={`input-control ${icon ? 'input-control-with-icon' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          className={`input ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="input-error-text">{error}</span>
      )}
    </div>
  );
}
