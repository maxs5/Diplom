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
      <input
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="input-error-text">{error}</span>
      )}
    </div>
  );
}
