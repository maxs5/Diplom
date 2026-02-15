/**
 * Контекст авторизации
 * 
 * Управляет состоянием авторизации пользователя:
 * - Вход (login)
 * - Регистрация (register)
 * - Выход (logout)
 * - Обновление профиля (updateProfile)
 * 
 * Данные сохраняются в localStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, DEFAULT_CATEGORIES } from '../../data/constants.js';
import { hashPasswordWithSalt, generateSalt, verifyPassword } from '../../utils/password.js';
import { Loader } from '../../components/common/Loader.jsx';

// Создаём контекст
const AuthContext = createContext(null);

/**
 * Провайдер контекста авторизации
 * Оборачивает всё приложение и предоставляет данные о пользователе
 */
export function AuthProvider({ children }) {
  // Состояние текущего пользователя
  const [user, setUser] = useState(null);
  
  // Флаг загрузки (проверяем localStorage при старте)
  const [loading, setLoading] = useState(true);

  /**
   * При монтировании компонента проверяем localStorage
   * Если там есть пользователь, восстанавливаем сессию
   */
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Вход в систему
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль
   * @returns {Object} { success: boolean, error?: string }
   */
  const login = (email, password) => {
    try {
      // Получаем всех зарегистрированных пользователей
      const users = JSON.parse(localStorage.getItem('financeApp_users') || '[]');
      
      // Ищем пользователя с таким email
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        return { success: false, error: 'Пользователь не найден' };
      }
      
      // Проверяем пароль с использованием хеширования
      const passwordHash = hashPasswordWithSalt(password, foundUser.passwordSalt);
      if (foundUser.passwordHash !== passwordHash) {
        return { success: false, error: 'Неверный пароль' };
      }
      
      // Создаём объект пользователя без пароля
      const userWithoutPassword = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        currency: foundUser.currency || 'RUB',
      };
      
      // Сохраняем в state и localStorage
      setUser(userWithoutPassword);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { success: false, error: 'Произошла ошибка при входе' };
    }
  };

  /**
   * Регистрация нового пользователя
   * @param {Object} data - Данные пользователя
   * @returns {Object} { success: boolean, error?: string }
   */
  const register = (data) => {
    try {
      const { email, password, name } = data;
      
      // Валидация
      if (!email || !password || !name) {
        return { success: false, error: 'Заполните все поля' };
      }
      
      if (password.length < 6) {
        return { success: false, error: 'Пароль должен быть не менее 6 символов' };
      }
      
      // Получаем список пользователей
      const users = JSON.parse(localStorage.getItem('financeApp_users') || '[]');
      
      // Проверяем, не занят ли email
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
      }
      
      // Генерируем соль и хешируем пароль
      const tempSalt = generateSalt();
      const passwordHash = hashPasswordWithSalt(password, tempSalt);
      
      // Создаём нового пользователя
      const newUser = {
        id: Date.now().toString(), // Простой способ генерации ID
        email,
        passwordHash, // Сохраняем хеш вместо пароля
        passwordSalt: tempSalt, // Сохраняем соль
        name,
        currency: 'RUB',
        createdAt: new Date().toISOString(),
      };
      
      // Добавляем в список
      users.push(newUser);
      localStorage.setItem('financeApp_users', JSON.stringify(users));
      
      // Создаём дефолтные категории для нового пользователя
      createDefaultCategories(newUser.id);
      
      // Автоматически входим
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        currency: newUser.currency,
      };
      
      setUser(userWithoutPassword);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { success: false, error: 'Произошла ошибка при регистрации' };
    }
  };

  /**
   * Создаёт дефолтные категории для нового пользователя
   */
  const createDefaultCategories = (userId) => {
    try {
      const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      
      const newCategories = DEFAULT_CATEGORIES.map(cat => ({
        id: `${userId}_${Date.now()}_${Math.random()}`,
        userId,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        createdAt: new Date().toISOString(),
      }));
      
      categories.push(...newCategories);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Ошибка создания дефолтных категорий:', error);
    }
  };

  /**
   * Выход из системы
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  /**
   * Обновление профиля пользователя
   * @param {Object} updates - Новые данные
   */
  const updateProfile = (updates) => {
    try {
      // Обновляем в state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Обновляем в localStorage (текущая сессия)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Обновляем в списке всех пользователей
      const users = JSON.parse(localStorage.getItem('financeApp_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('financeApp_users', JSON.stringify(users));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      return { success: false, error: 'Не удалось обновить профиль' };
    }
  };

  // Значение контекста, доступное всем компонентам
  const value = {
    user,           // Текущий пользователь (или null)
    loading,        // Идёт ли загрузка
    login,          // Функция входа
    register,       // Функция регистрации
    logout,         // Функция выхода
    updateProfile,  // Функция обновления профиля
    isAuthenticated: !!user, // Авторизован ли пользователь
  };

  // Пока инициализируем сессию, показываем загрузчик
  if (loading) {
    return <Loader text="Инициализация сессии..." fullScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для использования контекста авторизации
 * Использование: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  
  return context;
}
