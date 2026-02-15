/**
 * Компонент основного лэйаута приложения
 * 
 * Содержит:
 * - Шапку (Header)
 * - Боковое меню (Sidebar)
 * - Область контента
 */

import React, { useState } from 'react';
import { Header } from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';
import './Layout.css';

export function Layout({ children }) {
  // Состояние бокового меню (открыто/закрыто на мобильных)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Переключение бокового меню
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * Закрытие бокового меню (при клике на пункт меню на мобильных)
   */
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* Шапка */}
      <Header onMenuClick={toggleSidebar} />
      
      {/* Основная область */}
      <div className="layout-body">
        {/* Боковое меню */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Оверлей для мобильных (затемнение фона при открытом меню) */}
        {isSidebarOpen && (
          <div className="layout-overlay" onClick={closeSidebar} />
        )}
        
        {/* Контент страницы */}
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
