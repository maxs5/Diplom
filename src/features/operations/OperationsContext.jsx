import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { STORAGE_KEYS } from "../../data/constants.js";

const OperationsContext = createContext(null);

export function OperationsProvider({ children }) {
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user) return undefined;

    const handleDataRefresh = () => {
      loadOperations();
    };

    window.addEventListener("finance:operations-sync", handleDataRefresh);
    return () =>
      window.removeEventListener("finance:operations-sync", handleDataRefresh);
  }, [user]);

  const loadOperations = () => {
    try {
      const allOperations = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.OPERATIONS) || "[]",
      );
      const userOperations = allOperations.filter(
        (op) => op.userId === user.id,
      );

      const normalized = userOperations.map((op) => ({
        ...op,
        amount: Number(op.amount) || 0,
      }));

      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOperations(normalized);
    } catch (error) {
      console.error("Ошибка загрузки операций:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveOperations = (newOperations) => {
    try {
      const allOperations = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.OPERATIONS) || "[]",
      );
      const otherOperations = allOperations.filter(
        (op) => op.userId !== user.id,
      );

      const normalized = newOperations.map((op) => ({
        ...op,
        amount: Number(op.amount) || 0,
      }));

      const updated = [...otherOperations, ...normalized];

      localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(updated));

      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOperations(normalized);

      return { success: true };
    } catch (error) {
      console.error("Ошибка сохранения операций:", error);
      return { success: false, error: "Не удалось сохранить операцию" };
    }
  };

  const syncAccountBalancesByOperations = (nextOperations) => {
    const allAccounts = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || "[]",
    );
    const userAccounts = allAccounts.filter((acc) => acc.userId === user.id);
    const otherAccounts = allAccounts.filter((acc) => acc.userId !== user.id);

    const balancesDelta = new Map();
    nextOperations.forEach((op) => {
      const amount = Number(op.amount) || 0;
      const current = balancesDelta.get(op.accountId) || 0;
      const delta = op.type === "income" ? amount : -amount;
      balancesDelta.set(op.accountId, current + delta);
    });

    const recalculatedUserAccounts = userAccounts.map((acc) => {
      const base = Number(acc.initialBalance ?? acc.balance) || 0;
      const delta = balancesDelta.get(acc.id) || 0;
      return {
        ...acc,
        initialBalance: Number(acc.initialBalance ?? acc.balance) || 0,
        balance: base + delta,
        updatedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(
      STORAGE_KEYS.ACCOUNTS,
      JSON.stringify([...otherAccounts, ...recalculatedUserAccounts]),
    );
    window.dispatchEvent(new Event("finance:accounts-sync"));
  };

  const createOperation = (data) => {
    if (
      !data.accountId ||
      !data.categoryId ||
      data.amount === "" ||
      data.amount === null ||
      data.amount === undefined
    ) {
      return { success: false, error: "Заполните все обязательные поля" };
    }

    const amount = Number(data.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return { success: false, error: "Сумма должна быть больше 0" };
    }

    const newOperation = {
      id: `${user.id}_${Date.now()}_${Math.random()}`,
      userId: user.id,
      accountId: data.accountId,
      categoryId: data.categoryId,
      type: data.type,
      amount,
      date: data.date || new Date().toISOString(),
      comment: data.comment || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...operations, newOperation];
    syncAccountBalancesByOperations(updated);
    return saveOperations(updated);
  };

  const updateOperation = (id, updates) => {
    const oldOperation = operations.find((op) => op.id === id);
    if (!oldOperation) return { success: false, error: "Операция не найдена" };

    const newAmount =
      updates.amount !== undefined
        ? Number(updates.amount)
        : oldOperation.amount;
    if (
      updates.amount !== undefined &&
      (Number.isNaN(newAmount) || newAmount <= 0)
    ) {
      return { success: false, error: "Сумма должна быть больше 0" };
    }
    const updated = operations.map((op) =>
      op.id === id
        ? {
            ...op,
            ...updates,
            amount: newAmount,
            updatedAt: new Date().toISOString(),
          }
        : op,
    );

    syncAccountBalancesByOperations(updated);
    return saveOperations(updated);
  };

  const deleteOperation = (id) => {
    const operation = operations.find((op) => op.id === id);
    if (!operation) return { success: false, error: "Операция не найдена" };

    const updated = operations.filter((op) => op.id !== id);
    syncAccountBalancesByOperations(updated);
    return saveOperations(updated);
  };

  const getOperationById = (id) => operations.find((op) => op.id === id);

  const getFilteredOperations = (filters = {}) => {
    let filtered = [...operations];

    if (filters.type)
      filtered = filtered.filter((op) => op.type === filters.type);
    if (filters.accountId)
      filtered = filtered.filter((op) => op.accountId === filters.accountId);
    if (filters.categoryId)
      filtered = filtered.filter((op) => op.categoryId === filters.categoryId);
    if (filters.dateFrom)
      filtered = filtered.filter(
        (op) => new Date(op.date) >= new Date(filters.dateFrom),
      );
    if (filters.dateTo)
      filtered = filtered.filter(
        (op) => new Date(op.date) <= new Date(filters.dateTo),
      );

    return filtered;
  };

  const getStats = (filters = {}) => {
    const filtered = getFilteredOperations(filters);

    const income = filtered
      .filter((op) => op.type === "income")
      .reduce((sum, op) => sum + op.amount, 0);

    const expense = filtered
      .filter((op) => op.type === "expense")
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
  if (!context)
    throw new Error(
      "useOperations должен использоваться внутри OperationsProvider",
    );
  return context;
}
