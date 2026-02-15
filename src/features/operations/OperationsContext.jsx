import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useAccounts } from '../accounts/AccountsContext.jsx';
import { STORAGE_KEYS } from '../../data/constants.js';

const OperationsContext = createContext(null);

export function OperationsProvider({ children }) {
  const { user } = useAuth();
  const { updateBalance } = useAccounts();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOperations();
    } else {
      setOperations([]);
      setLoading(false);
    }
  }, [user]);

  const loadOperations = () => {
    try {
      const allOperations = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATIONS) || '[]');
      const userOperations = allOperations.filter(op => op.userId === user.id);

      const normalized = userOperations.map(op => ({
        ...op,
        amount: Number(op.amount) || 0,
      }));

      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOperations(normalized);
    } catch (error) {
      console.error('Ошибка загрузки операций:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOperations = (newOperations) => {
    try {
      const allOperations = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATIONS) || '[]');
      const otherOperations = allOperations.filter(op => op.userId !== user.id);

      const normalized = newOperations.map(op => ({
        ...op,
        amount: Number(op.amount) || 0,
      }));

      const updated = [...otherOperations, ...normalized];

      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(updated));

      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOperations(normalized);

      return { success: true };
    } catch (error) {
      console.error('Ошибка сохранения операций:', error);
      return { success: false, error: 'Не удалось сохранить операцию' };
    }
  };

  const createOperation = (data) => {
    if (!data.accountId || !data.categoryId || !data.amount) {
      return { success: false, error: 'Заполните все обязательные поля' };
    }

    const amount = Number(data.amount);

    const newOperation = {
      id: `${user.id}_${Date.now()}_${Math.random()}`,
      userId: user.id,
      accountId: data.accountId,
      categoryId: data.categoryId,
      type: data.type,
      amount,
      date: data.date || new Date().toISOString(),
      comment: data.comment || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const balanceChange = newOperation.type === 'income' ? amount : -amount;

    const balanceResult = updateBalance(newOperation.accountId, balanceChange);
    if (!balanceResult.success) return balanceResult;

    const updated = [...operations, newOperation];
    return saveOperations(updated);
  };

  const updateOperation = (id, updates) => {
    const oldOperation = operations.find(op => op.id === id);
    if (!oldOperation) return { success: false, error: 'Операция не найдена' };

    const newAmount =
      updates.amount !== undefined ? Number(updates.amount) : oldOperation.amount;

    const newType = updates.type || oldOperation.type;
    const newAccountId = updates.accountId || oldOperation.accountId;

    const amountChanged = newAmount !== oldOperation.amount;
    const typeChanged = newType !== oldOperation.type;
    const accountChanged = newAccountId !== oldOperation.accountId;

    if (amountChanged || typeChanged || accountChanged) {
      const oldBalanceChange =
        oldOperation.type === 'income'
          ? -oldOperation.amount
          : oldOperation.amount;

      updateBalance(oldOperation.accountId, oldBalanceChange);

      const newBalanceChange =
        newType === 'income' ? newAmount : -newAmount;

      updateBalance(newAccountId, newBalanceChange);
    }

    const updated = operations.map(op =>
      op.id === id
        ? { ...op, ...updates, amount: newAmount, updatedAt: new Date().toISOString() }
        : op
    );

    return saveOperations(updated);
  };

  const deleteOperation = (id) => {
    const operation = operations.find(op => op.id === id);
    if (!operation) return { success: false, error: 'Операция не найдена' };

    const balanceChange =
      operation.type === 'income'
        ? -operation.amount
        : operation.amount;

    updateBalance(operation.accountId, balanceChange);

    const updated = operations.filter(op => op.id !== id);
    return saveOperations(updated);
  };

  const getOperationById = (id) => operations.find(op => op.id === id);

  const getFilteredOperations = (filters = {}) => {
    let filtered = [...operations];

    if (filters.type) filtered = filtered.filter(op => op.type === filters.type);
    if (filters.accountId) filtered = filtered.filter(op => op.accountId === filters.accountId);
    if (filters.categoryId) filtered = filtered.filter(op => op.categoryId === filters.categoryId);
    if (filters.dateFrom) filtered = filtered.filter(op => new Date(op.date) >= new Date(filters.dateFrom));
    if (filters.dateTo) filtered = filtered.filter(op => new Date(op.date) <= new Date(filters.dateTo));

    return filtered;
  };

  const getStats = (filters = {}) => {
    const filtered = getFilteredOperations(filters);

    const income = filtered
      .filter(op => op.type === 'income')
      .reduce((sum, op) => sum + op.amount, 0);

    const expense = filtered
      .filter(op => op.type === 'expense')
      .reduce((sum, op) => sum + op.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      total: filtered.length,
    };
  };

  return (
    <OperationsContext.Provider
      value={{
        operations,
        loading,
        createOperation,
        updateOperation,
        deleteOperation,
        getOperationById,
        getFilteredOperations,
        getStats,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) throw new Error('useOperations должен использоваться внутри OperationsProvider');
  return context;
}
