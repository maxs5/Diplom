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
import { useDispatch, useSelector } from 'react-redux';
import { STORAGE_KEYS, DEFAULT_CATEGORIES } from '../../data/constants.js';
import { Loader } from '../../components/common/Loader.jsx';
import { setUser, clearUser } from '../../store/authSlice.js';

// Создаём контекст
const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'financeApp_token';

/**
 * Провайдер контекста авторизации
 * Оборачивает всё приложение и предоставляет данные о пользователе
 */
export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  // Флаг загрузки (проверяем localStorage при старте)
  const [loading, setLoading] = useState(true);

  const parseJsonSafe = async (response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  /**
   * При монтировании компонента проверяем localStorage
   * Если там есть пользователь, восстанавливаем сессию
   */
  useEffect(() => {
    const initializeSession = async () => {
      let savedUser = null;
      try {
        const savedUserRaw = localStorage.getItem(STORAGE_KEYS.USER);
        savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
      } catch {
        savedUser = null;
      }

      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) {
          if (savedUser) {
            dispatch(setUser(savedUser));
          }
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        }

        if (!response.ok) {
          if (savedUser) {
            dispatch(setUser(savedUser));
            return;
          }
          throw new Error('SESSION_CHECK_FAILED');
        }

        let data;
        try {
          data = await response.json();
        } catch (error) {
          if (savedUser) {
            dispatch(setUser(savedUser));
            return;
          }
          throw error;
        }

        dispatch(setUser(data.user));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
        if (error.message === 'UNAUTHORIZED') {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(STORAGE_KEYS.USER);
          dispatch(clearUser());
        } else if (savedUser) {
          dispatch(setUser(savedUser));
        } else {
          dispatch(clearUser());
        }
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [dispatch]);

  /**
   * Вход в систему
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль
   * @returns {Object} { success: boolean, error?: string }
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        return { success: false, error: data.error || 'Неверный email или пароль' };
      }

      dispatch(setUser(data.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      
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
  const register = async (data) => {
    try {
      const { email, password, name } = data;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const result = await parseJsonSafe(response);
      if (!response.ok) {
        return { success: false, error: result.error || 'Ошибка регистрации' };
      }

      createDefaultCategories(result.user.id);

      dispatch(setUser(result.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
      
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
    dispatch(clearUser());
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  /**
   * Обновление профиля пользователя
   * @param {Object} updates - Новые данные
   */
  const updateProfile = async (updates) => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        return { success: false, error: 'Сессия истекла. Войдите снова.' };
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        return { success: false, error: data.error || 'Не удалось обновить профиль' };
      }

      dispatch(setUser(data.user));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

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
