/**
 * Контекст для управления бюджетами
 * Бюджет - это предел расходов для категории на определенный период
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useOperations } from "./OperationsContext.jsx";
import { STORAGE_KEYS } from "../../data/constants.js";
import { startOfMonth, endOfMonth } from "../../utils/date.js";
import { Loader } from "../../components/common/Loader.jsx";

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const { user } = useAuth();
  const { operations } = useOperations();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Загружаем бюджеты при монтировании
   */
  useEffect(() => {
    if (user) {
      loadBudgets();
    } else {
      setBudgets([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    const handleDataRefresh = () => {
      loadBudgets();
    };

    window.addEventListener("finance:budgets-sync", handleDataRefresh);
    return () =>
      window.removeEventListener("finance:budgets-sync", handleDataRefresh);
  }, [user]);

  /**
   * Загрузка бюджетов пользователя
   */
  const loadBudgets = () => {
    try {
      const allBudgets = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.BUDGETS) || "[]",
      );
      const userBudgets = allBudgets.filter((b) => b.userId === user.id);
      setBudgets(userBudgets);
    } catch (error) {
      console.error("Ошибка загрузки бюджетов:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Создание бюджета
   */
  const createBudget = (data) => {
    try {
      const { categoryId, limit, period = "monthly" } = data;

      if (!categoryId || !limit) {
        return { success: false, error: "Заполните все обязательные поля" };
      }

      // Проверка, не существует ли уже бюджет для этой категории
      if (
        budgets.find((b) => b.categoryId === categoryId && b.period === period)
      ) {
        return {
          success: false,
          error: "Бюджет для этой категории уже существует",
        };
      }

      const newBudget = {
        id: Date.now().toString(),
        userId: user.id,
        categoryId,
        limit: parseFloat(limit),
        period, // 'weekly', 'monthly', 'yearly'
        spent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const allBudgets = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.BUDGETS) || "[]",
      );
      allBudgets.push(newBudget);
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(allBudgets));

      setBudgets([...budgets, newBudget]);
      return { success: true, data: newBudget };
    } catch (error) {
      console.error("Ошибка создания бюджета:", error);
      return { success: false, error: "Не удалось создать бюджет" };
    }
  };

  /**
   * Обновление бюджета
   */
  const updateBudget = (id, updates) => {
    try {
      const updated = budgets.map((b) =>
        b.id === id
          ? { ...b, ...updates, updatedAt: new Date().toISOString() }
          : b,
      );
      setBudgets(updated);

      const allBudgets = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.BUDGETS) || "[]",
      );
      const index = allBudgets.findIndex((b) => b.id === id);

      if (index !== -1) {
        allBudgets[index] = {
          ...allBudgets[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(allBudgets));
      }

      return { success: true };
    } catch (error) {
      console.error("Ошибка обновления бюджета:", error);
      return { success: false, error: "Не удалось обновить бюджет" };
    }
  };

  /**
   * Удаление бюджета
   */
  const deleteBudget = (id) => {
    try {
      const updated = budgets.filter((b) => b.id !== id);
      setBudgets(updated);

      const allBudgets = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.BUDGETS) || "[]",
      );
      const filtered = allBudgets.filter((b) => b.id !== id);
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(filtered));

      return { success: true };
    } catch (error) {
      console.error("Ошибка удаления бюджета:", error);
      return { success: false, error: "Не удалось удалить бюджет" };
    }
  };

  /**
   * Получить потраченных денег по категории за период
   */
  const getSpentByCategory = (categoryId, period = "monthly") => {
    const now = new Date();
    let startDate, endDate;

    if (period === "weekly") {
      const day = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (period === "monthly") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    return operations
      .filter(
        (op) =>
          op.type === "expense" &&
          op.categoryId === categoryId &&
          new Date(op.date) >= startDate &&
          new Date(op.date) <= endDate,
      )
      .reduce((sum, op) => sum + op.amount, 0);
  };

  /**
   * Получить все бюджеты с информацией о потратах
   */
  const getBudgetsWithStatus = () => {
    return budgets.map((budget) => ({
      ...budget,
      spent: getSpentByCategory(budget.categoryId, budget.period),
      percentage: Math.round(
        (getSpentByCategory(budget.categoryId, budget.period) / budget.limit) *
          100,
      ),
      isExceeded:
        getSpentByCategory(budget.categoryId, budget.period) > budget.limit,
    }));
  };

  /**
   * Получить список превышенных бюджетов (для уведомлений)
   */
  const getExceededBudgets = () => {
    return getBudgetsWithStatus().filter((b) => b.isExceeded);
  };

  const value = {
    budgets,
    loading,
    createBudget,
    updateBudget,
    deleteBudget,
    getSpentByCategory,
    getBudgetsWithStatus,
    getExceededBudgets,
  };

  if (loading) {
    return <Loader text="Загрузка бюджетов..." fullScreen />;
  }

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudget должен использоваться внутри BudgetProvider");
  }

  return context;
}
