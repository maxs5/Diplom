/**
 * Контекст для управления категориями
 * 
 * Категории делятся на два типа:
 * - income (доходы)
 * - expense (расходы)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { STORAGE_KEYS } from '../../data/constants.js';

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Загружаем категории при монтировании
   */
  useEffect(() => {
    if (user) {
      loadCategories();
    } else {
      setCategories([]);
      setLoading(false);
    }
  }, [user]);

  /**
   * Загрузка категорий пользователя
   */
  const loadCategories = () => {
    try {
      const allCategories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      // Только категории текущего пользователя
      const userCategories = allCategories.filter(cat => cat.userId === user.id);
      setCategories(userCategories);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Сохранение категорий в localStorage
   */
  const saveCategories = (newCategories) => {
    try {
      const allCategories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
      const otherCategories = allCategories.filter(cat => cat.userId !== user.id);
      const updated = [...otherCategories, ...newCategories];
      
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
      setCategories(newCategories);
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка сохранения категорий:', error);
      return { success: false, error: 'Не удалось сохранить категорию' };
    }
  };

  /**
   * Создание новой категории
   */
  const createCategory = (data) => {
    // Проверяем, нет ли уже такой категории
    const exists = categories.find(
      cat => cat.name.toLowerCase() === data.name.toLowerCase() && cat.type === data.type
    );
    
    if (exists) {
      return { success: false, error: 'Категория с таким именем уже существует' };
    }
    
    const newCategory = {
      id: `${user.id}_${Date.now()}_${Math.random()}`,
      userId: user.id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updated = [...categories, newCategory];
    return saveCategories(updated);
  };

  /**
   * Обновление категории
   */
  const updateCategory = (id, updates) => {
    const updated = categories.map(cat =>
      cat.id === id
        ? { ...cat, ...updates, updatedAt: new Date().toISOString() }
        : cat
    );
    return saveCategories(updated);
  };

  /**
   * Удаление категории
   */
  const deleteCategory = (id) => {
    const updated = categories.filter(cat => cat.id !== id);
    return saveCategories(updated);
  };

  /**
   * Получить категорию по ID
   */
  const getCategoryById = (id) => {
    return categories.find(cat => cat.id === id);
  };

  /**
   * Получить категории определённого типа (income/expense)
   */
  const getCategoriesByType = (type) => {
    return categories.filter(cat => cat.type === type);
  };

  /**
   * Получить категории доходов
   */
  const getIncomeCategories = () => {
    return getCategoriesByType('income');
  };

  /**
   * Получить категории расходов
   */
  const getExpenseCategories = () => {
    return getCategoriesByType('expense');
  };

  const value = {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByType,
    getIncomeCategories,
    getExpenseCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

/**
 * Хук для использования контекста категорий
 */
export function useCategories() {
  const context = useContext(CategoriesContext);
  
  if (!context) {
    throw new Error('useCategories должен использоваться внутри CategoriesProvider');
  }
  
  return context;
}
