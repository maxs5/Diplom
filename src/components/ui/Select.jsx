/**
 * Компонент выпадающего списка
 * 
 * Простой select с поддержкой label и ошибок
 * 
 * Пропсы:
 * - label: подпись к полю
 * - error: текст ошибки
 * - options: массив объектов { value, label }
 * - ...rest: остальные атрибуты select
 */

import React from 'react';
import './Select.css';

export function Select({ 
  label, 
  error, 
  options = [],
  className = '',
  children,
  ...props 
}) {
  return (
    <div className="select-wrapper">
      {label && (
        <label className="select-label">
          {label}
        </label>
      )}
      <select
        className={`select ${error ? 'select-error' : ''} ${className}`}
        {...props}
      >
        {children || options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="select-error-text">{error}</span>
      )}
    </div>
  );
}
