/**
 * Компонент защищённого маршрута
 *
 * Проверяет, авторизован ли пользователь.
 * Если нет - перенаправляет на страницу входа
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext.jsx";
import { Loader } from "./Loader.jsx";

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Защищённый контент
 */
export function ProtectedRoute({ children }) {
  // Получаем информацию об авторизации
  const { isAuthenticated, loading } = useAuth();

  // Пока проверяем авторизацию, ничего не показываем
  if (loading) {
    return <Loader text="Проверяем авторизацию..." fullScreen />;
  }

  // Если не авторизован - перенаправляем на /auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Если авторизован - показываем защищённый контент
  return children;
}
