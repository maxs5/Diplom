/**
 * Страница управления бюджетами
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBudget } from "../features/operations/BudgetContext.jsx";
import { useCategories } from "../features/categories/CategoriesContext.jsx";
import { Loader } from "../components/common/Loader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { formatCurrency } from "../utils/currency.js";
import { CATEGORY_ICONS } from "../data/constants.js";
import "./BudgetsPage.css";

export function BudgetsPage() {
  const navigate = useNavigate();
  const {
    createBudget,
    deleteBudget,
    getBudgetsWithStatus,
    loading: budgetsLoading,
  } = useBudget();
  const { categories, loading: categoriesLoading } = useCategories();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    limit: "",
    period: "monthly",
  });
  const [errors, setErrors] = useState({});

  /**
   * Валидация
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = "Выберите категорию";
    }

    if (!formData.limit) {
      newErrors.limit = "Введите лимит";
    } else if (
      isNaN(parseFloat(formData.limit)) ||
      parseFloat(formData.limit) <= 0
    ) {
      newErrors.limit = "Введите положительное число";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Добавление нового бюджета
   */
  const handleAddBudget = () => {
    if (!validate()) return;

    const result = createBudget(formData);

    if (result.success) {
      toast.success("Бюджет создан");
      setFormData({ categoryId: "", limit: "", period: "monthly" });
      setIsAdding(false);
    } else {
      toast.error(result.error);
    }
  };

  /**
   * Удаление бюджета
   */
  const handleDeleteBudget = (id) => {
    if (window.confirm("Удалить этот бюджет?")) {
      const result = deleteBudget(id);
      if (result.success) {
        toast.success("Бюджет удален");
      } else {
        toast.error(result.error);
      }
    }
  };

  /**
   * Получить категорию по ID
   */
  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name || "Неизвестно";
  };

  /**
   * Получить иконку категории
   */
  const getCategoryIcon = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    const icon = CATEGORY_ICONS.find((i) => i.id === category?.icon);
    return icon?.emoji || "📌";
  };

  /**
   * Получить название периода
   */
  const getPeriodLabel = (period) => {
    const labels = {
      weekly: "Неделя",
      monthly: "Месяц",
      yearly: "Год",
    };
    return labels[period] || period;
  };

  /**
   * Получить цвет для прогресса
   */
  const getProgressColor = (percentage) => {
    if (percentage <= 50) return "#10b981"; // зеленый
    if (percentage <= 80) return "#f59e0b"; // оранжевый
    return "#ef4444"; // красный
  };

  const budgetsWithStatus = getBudgetsWithStatus();

  if (budgetsLoading || categoriesLoading) {
    return <Loader text="Загрузка бюджетов..." />;
  }

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <h1>Бюджеты</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "✕ Отмена" : "+ Новый бюджет"}
        </Button>
      </div>

      {/* Форма добавления бюджета */}
      {isAdding && (
        <Card title="Новый бюджет" className="add-budget-form">
          <div className="form-group">
            <label>Категория *</label>
            <Select
              value={formData.categoryId}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  categoryId: e.target.value,
                }));
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: undefined }));
              }}
              options={[
                { value: "", label: "Выберите категорию" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />
            {errors.categoryId && (
              <span className="error">{errors.categoryId}</span>
            )}
          </div>

          <div className="form-group">
            <label>Лимит *</label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.limit}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, limit: e.target.value }));
                if (errors.limit)
                  setErrors((prev) => ({ ...prev, limit: undefined }));
              }}
              min="0.01"
              step="0.01"
            />
            {errors.limit && <span className="error">{errors.limit}</span>}
          </div>

          <div className="form-group">
            <label>Период</label>
            <Select
              value={formData.period}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, period: e.target.value }))
              }
              options={[
                { value: "weekly", label: "Неделя" },
                { value: "monthly", label: "Месяц" },
                { value: "yearly", label: "Год" },
              ]}
            />
          </div>

          <Button onClick={handleAddBudget} style={{ marginTop: "16px" }}>
            Создать бюджет
          </Button>
        </Card>
      )}

      {/* Список бюджетов */}
      <div className="budgets-list">
        {budgetsWithStatus.length === 0 ? (
          <Card>
            <div className="empty-state">
              <p>Бюджеты не созданы</p>
              <p className="text-secondary">
                Создайте первый бюджет, чтобы контролировать расходы
              </p>
            </div>
          </Card>
        ) : (
          budgetsWithStatus.map((budget) => (
            <Card key={budget.id} className="budget-card">
              <div className="budget-header">
                <div className="budget-info">
                  <span className="budget-icon">
                    {getCategoryIcon(budget.categoryId)}
                  </span>
                  <div className="budget-details">
                    <h3>{getCategoryName(budget.categoryId)}</h3>
                    <p className="text-secondary">
                      {getPeriodLabel(budget.period)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBudget(budget.id)}
                >
                  🗑️
                </Button>
              </div>

              <div className="budget-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(budget.percentage, 100)}%`,
                      backgroundColor: getProgressColor(budget.percentage),
                    }}
                  />
                </div>
                <div className="progress-text">
                  <span>{formatCurrency(budget.spent)}</span>
                  <span className="text-secondary">
                    / {formatCurrency(budget.limit)}
                  </span>
                </div>
              </div>

              {budget.isExceeded && (
                <div className="warning-message">
                  ⚠️ Бюджет превышен на{" "}
                  {formatCurrency(budget.spent - budget.limit)}
                </div>
              )}

              <div className="progress-percentage">
                <span
                  className={`percentage ${budget.percentage > 100 ? "exceeded" : ""}`}
                >
                  {budget.percentage}%
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
