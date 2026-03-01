import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { STORAGE_KEYS } from '../../data/constants.js';

const AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    const handleDataRefresh = () => {
      loadAccounts();
    };

    window.addEventListener('finance:accounts-sync', handleDataRefresh);
    return () => window.removeEventListener('finance:accounts-sync', handleDataRefresh);
  }, [user]);

  const loadAccounts = () => {
    try {
      const allAccounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
      const userAccounts = allAccounts.filter(acc => acc.userId === user.id);

      // Приводим баланс к числу на всякий случай
      const normalized = userAccounts.map(acc => ({
        ...acc,
        initialBalance: Number(acc.initialBalance ?? acc.balance) || 0,
        balance: Number(acc.balance) || 0,
      }));

      setAccounts(normalized);
    } catch (error) {
      console.error('Ошибка загрузки счетов:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAccounts = (newAccounts) => {
    try {
      const allAccounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
      const otherAccounts = allAccounts.filter(acc => acc.userId !== user.id);

      const normalized = newAccounts.map(acc => ({
        ...acc,
        initialBalance: Number(acc.initialBalance ?? acc.balance) || 0,
        balance: Number(acc.balance) || 0,
      }));

      const updated = [...otherAccounts, ...normalized];

      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
      setAccounts(normalized);

      return { success: true };
    } catch (error) {
      console.error('Ошибка сохранения счетов:', error);
      return { success: false, error: 'Не удалось сохранить счёт' };
    }
  };

  const createAccount = (data) => {
    const newAccount = {
      id: `${user.id}_${Date.now()}_${Math.random()}`,
      userId: user.id,
      name: data.name,
      type: data.type,
      initialBalance: Number(data.initialBalance) || 0,
      balance: Number(data.initialBalance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...accounts, newAccount];
    return saveAccounts(updated);
  };

  const updateAccount = (id, updates) => {
    const updated = accounts.map(acc =>
      acc.id === id
        ? { ...acc, ...updates, balance: Number(updates.balance ?? acc.balance), updatedAt: new Date().toISOString() }
        : acc
    );
    return saveAccounts(updated);
  };

  const deleteAccount = (id) => {
    try {
      const updatedAccounts = accounts.filter(acc => acc.id !== id);
      const saveResult = saveAccounts(updatedAccounts);
      if (!saveResult.success) return saveResult;

      // Каскадно удаляем операции по удалённому счёту
      const allOperations = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATIONS) || '[]');
      const filteredOperations = allOperations.filter(
        op => !(op.userId === user.id && op.accountId === id)
      );
      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(filteredOperations));

      // Каскадно удаляем рекуррентные операции по удалённому счёту
      const allRecurring = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING) || '[]');
      const filteredRecurring = allRecurring.filter(
        op => !(op.userId === user.id && op.accountId === id)
      );
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(filteredRecurring));

      window.dispatchEvent(new Event('finance:accounts-sync'));
      window.dispatchEvent(new Event('finance:operations-sync'));
      window.dispatchEvent(new Event('finance:recurring-sync'));
      return { success: true };
    } catch (error) {
      console.error('Ошибка каскадного удаления счёта:', error);
      return { success: false, error: 'Не удалось удалить счёт' };
    }
  };

  const getAccountById = (id) => accounts.find(acc => acc.id === id);

  const updateBalance = (accountId, amount) => {
    const account = getAccountById(accountId);
    if (!account) return { success: false, error: 'Счёт не найден' };

    const newBalance = Number(account.balance) + Number(amount);

    return updateAccount(accountId, { balance: newBalance });
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        createAccount,
        updateAccount,
        deleteAccount,
        getAccountById,
        updateBalance,
        getTotalBalance,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) throw new Error('useAccounts должен использоваться внутри AccountsProvider');
  return context;
}
