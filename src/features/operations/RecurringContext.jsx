/**
 * Контекст для управления рекуррентными операциями
 * Рекуррентная операция - это операция, которая повторяется регулярно
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useOperations } from './OperationsContext.jsx';
import { STORAGE_KEYS } from '../../data/constants.js';
import { Loader } from '../../components/common/Loader.jsx';

const RecurringContext = createContext(null);

export function RecurringProvider({ children }) {
  const { user } = useAuth();
  const { createOperation } = useOperations();
  const [recurringOps, setRecurringOps] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Загружаем рекуррентные операции при монтировании
   */
  useEffect(() => {
    if (user) {
      loadRecurring();
    } else {
      setRecurringOps([]);
      setLoading(false);
    }
  }, [user]);

  /**
   * Загрузка рекуррентных операций пользователя
   */
  const loadRecurring = () => {
    try {
      const allRecurring = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING) || '[]');
      const userRecurring = allRecurring.filter(op => op.userId === user.id);
      setRecurringOps(userRecurring);
    } catch (error) {
      console.error('Ошибка загрузки рекуррентных операций:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Создание рекуррентной операции
   */
  const createRecurring = (data) => {
    try {
      const { type, accountId, categoryId, amount, comment, interval, nextDate } = data;

      // Валидация
      if (!type || !accountId || !categoryId || !amount || !interval || !nextDate) {
        return { success: false, error: 'Заполните все обязательные поля' };
      }

      const newRecurring = {
        id: Date.now().toString(),
        userId: user.id,
        type,
        accountId,
        categoryId,
        amount: parseFloat(amount),
        comment,
        interval, // 'daily', 'weekly', 'monthly', 'yearly'
        nextDate,
        lastExecuted: null,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const allRecurring = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING) || '[]');
      allRecurring.push(newRecurring);
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(allRecurring));

      setRecurringOps([...recurringOps, newRecurring]);
      return { success: true, data: newRecurring };
    } catch (error) {
      console.error('Ошибка создания рекуррентной операции:', error);
      return { success: false, error: 'Не удалось создать операцию' };
    }
  };

  /**
   * Обновление рекуррентной операции
   */
  const updateRecurring = (id, updates) => {
    try {
      const updated = recurringOps.map(op => op.id === id ? { ...op, ...updates } : op);
      setRecurringOps(updated);

      const allRecurring = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING) || '[]');
      const index = allRecurring.findIndex(op => op.id === id);
      
      if (index !== -1) {
        allRecurring[index] = { ...allRecurring[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(allRecurring));
      }

      return { success: true };
    } catch (error) {
      console.error('Ошибка обновления рекуррентной операции:', error);
      return { success: false, error: 'Не удалось обновить операцию' };
    }
  };

  /**
   * Удаление рекуррентной операции
   */
  const deleteRecurring = (id) => {
    try {
      const updated = recurringOps.filter(op => op.id !== id);
      setRecurringOps(updated);

      const allRecurring = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING) || '[]');
      const filtered = allRecurring.filter(op => op.id !== id);
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(filtered));

      return { success: true };
    } catch (error) {
      console.error('Ошибка удаления рекуррентной операции:', error);
      return { success: false, error: 'Не удалось удалить операцию' };
    }
  };

  /**
   * Выполнение рекуррентных операций (вызывается при запуске приложения)
   * Проверяет, какие рекуррентные операции нужно выполнить
   */
  const executeRecurring = () => {
    const now = new Date();
    const updated = [];

    recurringOps.forEach(recurring => {
      if (!recurring.isActive) return;

      const nextDate = new Date(recurring.nextDate);
      
      if (nextDate <= now) {
        // Выполняем операцию
        createOperation({
          type: recurring.type,
          accountId: recurring.accountId,
          categoryId: recurring.categoryId,
          amount: recurring.amount,
          comment: recurring.comment ? `[Рекуррент] ${recurring.comment}` : '[Рекуррентная операция]',
          date: new Date().toISOString(),
        });

        // Вычисляем следующую дату
        const newNextDate = calculateNextDate(nextDate, recurring.interval);
        updateRecurring(recurring.id, {
          lastExecuted: new Date().toISOString(),
          nextDate: newNextDate.toISOString(),
        });

        updated.push(recurring.id);
      }
    });

    if (updated.length > 0) {
      console.log(`✅ Выполнено ${updated.length} рекуррентных операций`);
    }
  };

  /**
   * Вычисляет следующую дату на основе интервала
   */
  const calculateNextDate = (currentDate, interval) => {
    const next = new Date(currentDate);

    switch (interval) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }

    return next;
  };

  const value = {
    recurringOps,
    loading,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurring,
  };

  if (loading) {
    return <Loader text="Загрузка автоплатежей..." fullScreen />;
  }

  return (
    <RecurringContext.Provider value={value}>
      {children}
    </RecurringContext.Provider>
  );
}

export function useRecurring() {
  const context = useContext(RecurringContext);
  
  if (!context) {
    throw new Error('useRecurring должен использоваться внутри RecurringProvider');
  }
  
  return context;
}
