/**
 * Компонент бокового меню
 * 
 * Содержит навигацию по основным разделам приложения
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// Пункты меню
const menuItems = [
  {
    path: '/',
    label: 'Главная',
    icon: '🏠',
    exact: true,
  },
  {
    path: '/operations',
    label: 'История операций',
    icon: '📊',
  },
  {
    path: '/operations/new',
    label: 'Новая операция',
    icon: '➕',
  },
  {
    path: '/accounts/new',
    label: 'Новый счёт',
    icon: '💳',
  },
  {
    path: '/categories/new',
    label: 'Новая категория',
    icon: '🏷️',
  },
    {
      path: '/budgets',
      label: 'Бюджеты',
      icon: '💰',
    },
  {
    path: '/settings',
    label: 'Настройки',
    icon: '⚙️',
  },
];

export function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
            onClick={onClose}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
