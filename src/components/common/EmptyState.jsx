/**
 * Компонент пустого состояния
 * 
 * Показывается когда нет данных для отображения
 */

import React from 'react';
import './EmptyState.css';

/**
 * @param {Object} props
 * @param {string} props.icon - Emoji иконка
 * @param {string} props.title - Заголовок
 * @param {string} props.description - Описание
 * @param {React.ReactNode} props.action - Кнопка действия
 */
export function EmptyState({ icon = '📭', title, description, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
