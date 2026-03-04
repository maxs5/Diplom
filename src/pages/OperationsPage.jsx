/**
 * Страница истории операций
 *
 * Показывает все операции пользователя с возможностью:
 * - Фильтрации (по типу, счёту, категории, дате)
 * - Пагинации
 * - Редактирования и удаления
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOperations } from "../features/operations/OperationsContext.jsx";
import { useAccounts } from "../features/accounts/AccountsContext.jsx";
import { useCategories } from "../features/categories/CategoriesContext.jsx";
import { Loader } from "../components/common/Loader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Input } from "../components/ui/Input.jsx";
import { formatCurrency } from "../utils/currency.js";
import { formatDate, toInputDateFormat } from "../utils/date.js";
import { CATEGORY_ICONS } from "../data/constants.js";
import { exportOperationsToCSV, downloadCSV } from "../utils/export.js";
import "./OperationsPage.css";

export function OperationsPage() {
  const navigate = useNavigate();
  const {
    deleteOperation,
    getFilteredOperations,
    loading: operationsLoading,
  } = useOperations();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { categories, loading: categoriesLoading } = useCategories();

  // Фильтры
  const [filters, setFilters] = useState({
    type: "",
    accountId: "",
    categoryId: "",
    dateFrom: "",
    dateTo: "",
  });

  // Пагинация
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  /**
   * Обработчик изменения фильтра
   */
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1); // Сбрасываем на первую страницу при изменении фильтра
  };

  /**
   * Сброс фильтров
   */
  const resetFilters = () => {
    setFilters({
      type: "",
      accountId: "",
      categoryId: "",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  /**
   * Получаем отфильтрованные операции
   */
  const filteredOperations = getFilteredOperations(filters);

  // Пагинация
  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedOperations = filteredOperations.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  /**
   * Удаление операции
   */
  const handleDelete = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить эту операцию?")) {
      const result = deleteOperation(id);
      if (result.success) {
        toast.success("Операция удалена");
      } else {
        toast.error(result.error);
      }
    }
  };

  /**
   * Получить информацию об операции
   */
  const getOperationDetails = (operation) => {
    const account = accounts.find((a) => a.id === operation.accountId);
    const category = categories.find((c) => c.id === operation.categoryId);
    const icon = CATEGORY_ICONS.find((i) => i.id === category?.icon);

    return {
      account: account?.name || "Неизвестно",
      category: category?.name || "Неизвестно",
      icon: icon?.emoji || "📌",
    };
  };

  if (operationsLoading || accountsLoading || categoriesLoading) {
    return <Loader text="Загрузка операций..." />;
  }

  return (
    <div className="operations-page">
      <div className="operations-header">
        <h1>История операций</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            onClick={() => {
              const csv = exportOperationsToCSV(
                filteredOperations.map((op) => ({
                  ...op,
                  accountName:
                    accounts.find((a) => a.id === op.accountId)?.name || "",
                  categoryName:
                    categories.find((c) => c.id === op.categoryId)?.name || "",
                })),
              );
              downloadCSV(
                csv,
                `операции-${new Date().toISOString().split("T")[0]}.csv`,
              );
              toast.success("Экспортировано в CSV");
            }}
          >
            📥 Экспорт CSV
          </Button>
          <Button onClick={() => navigate("/operations/new")}>
            + Новая операция
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <Card title="Фильтры" className="filters-card">
        <div className="filters-grid">
          {/* Тип операции */}
          <Select
            label="Тип"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            options={[
              { value: "", label: "Все" },
              { value: "income", label: "Доходы" },
              { value: "expense", label: "Расходы" },
            ]}
          />

          {/* Счёт */}
          <Select
            label="Счёт"
            value={filters.accountId}
            onChange={(e) => handleFilterChange("accountId", e.target.value)}
            options={[
              { value: "", label: "Все счета" },
              ...accounts.map((acc) => ({ value: acc.id, label: acc.name })),
            ]}
          />

          {/* Категория */}
          <Select
            label="Категория"
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            options={[
              { value: "", label: "Все категории" },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
          />

          {/* Дата от */}
          <Input
            label="Дата от"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          />

          {/* Дата до */}
          <Input
            label="Дата до"
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          />

          {/* Кнопка сброса */}
          <div className="filter-actions">
            <Button variant="secondary" onClick={resetFilters} fullWidth>
              Сбросить
            </Button>
          </div>
        </div>

        {/* Информация о фильтрации */}
        <div className="filters-info">
          Найдено операций: {filteredOperations.length}
        </div>
      </Card>

      {/* Список операций */}
      <Card className="operations-list-card">
        {paginatedOperations.length > 0 ? (
          <>
            <div className="operations-list">
              {paginatedOperations.map((operation) => {
                const details = getOperationDetails(operation);
                return (
                  <div key={operation.id} className="operation-item">
                    {/* Иконка и информация */}
                    <div className="operation-main">
                      <div className="operation-icon">{details.icon}</div>
                      <div className="operation-info">
                        <div className="operation-category">
                          {details.category}
                        </div>
                        <div className="operation-meta">
                          <span>{details.account}</span>
                          <span>•</span>
                          <span>{formatDate(operation.date)}</span>
                        </div>
                        {operation.comment && (
                          <div className="operation-comment">
                            {operation.comment}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Сумма и действия */}
                    <div className="operation-right">
                      <div className={`operation-amount ${operation.type}`}>
                        {operation.type === "income" ? "+" : "-"}
                        {formatCurrency(operation.amount)}
                      </div>
                      <div className="operation-actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/operations/${operation.id}`)
                          }
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(operation.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="pagination">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Назад
                </Button>
                <span className="pagination-info">
                  Страница {page} из {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Вперёд →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>Нет операций для отображения</p>
            <Button onClick={() => navigate("/operations/new")}>
              Создать первую операцию
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
