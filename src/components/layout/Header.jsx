/**
 * Компонент шапки приложения
 *
 * Содержит:
 * - Кнопку меню (на мобильных)
 * - Название приложения
 * - Информацию о пользователе
 * - Кнопку выхода
 */

import React from "react";
import { useAuth } from "../../features/auth/AuthContext.jsx";
import { useTheme } from "../../features/theme/ThemeContext.jsx";
import { Button } from "../ui/Button.jsx";
import "./Header.css";

export function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-left">
        {/* Кнопка меню (показывается только на мобильных) */}
        <button
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Открыть меню"
        >
          ☰
        </button>

        {/* Логотип и название */}
        <div className="header-brand">
          <span className="header-logo">💰</span>
          <span className="header-title">Finance App</span>
        </div>
      </div>

      <div className="header-right">
        {/* Кнопка переключения темы */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          title={isDark ? "Светлая тема" : "Темная тема"}
        >
          {isDark ? "☀️" : "🌙"}
        </Button>

        {/* Информация о пользователе */}
        <div className="header-user">
          <span className="header-user-icon">👤</span>
          <span className="header-user-name">{user?.name}</span>
        </div>

        {/* Кнопка выхода */}
        <Button variant="ghost" size="sm" onClick={logout} title="Выйти">
          <span className="header-logout-icon">🚪</span>
          <span className="header-logout-text">Выход</span>
        </Button>
      </div>
    </header>
  );
}
