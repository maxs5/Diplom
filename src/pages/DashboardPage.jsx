/**
 * Главная страница (Dashboard)
 * 
 * Отображает:
 * - Общую статистику (доходы, расходы, баланс)
 * - Счета пользователя
 * - Категории
 * - Графики аналитики
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../features/accounts/AccountsContext.jsx';
import { useCategories } from '../features/categories/CategoriesContext.jsx';
import { useOperations } from '../features/operations/OperationsContext.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { formatCurrency, formatCurrencyShort } from '../utils/currency.js';
import { startOfMonth, endOfMonth, startOfYear } from '../utils/date.js';
import { ACCOUNT_TYPES, CATEGORY_ICONS } from '../data/constants.js';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './DashboardPage.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const { accounts, getTotalBalance, loading: accountsLoading } = useAccounts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { operations, getStats, loading: operationsLoading } = useOperations();

  // Фильтр периода (месяц/год)
  const [period, setPeriod] = useState('month');

  /**
   * Получаем статистику за выбранный период
   */
  const getPeriodStats = () => {
    const now = new Date();
    const filters = period === 'month'
      ? { dateFrom: startOfMonth(now), dateTo: endOfMonth(now) }
      : { dateFrom: startOfYear(now), dateTo: now };
    
    return getStats(filters);
  };

  const stats = getPeriodStats();

  /**
   * Данные для графика расходов по категориям
   */
  const getExpensesByCategory = () => {
    const expenseOps = operations.filter(op => op.type === 'expense');
    
    const categoryTotals = {};
    expenseOps.forEach(op => {
      const category = categories.find(c => c.id === op.categoryId);
      if (category) {
        if (!categoryTotals[category.name]) {
          categoryTotals[category.name] = 0;
        }
        categoryTotals[category.name] += op.amount;
      }
    });
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Топ 5 категорий
  };

  /**
   * Данные для графика доходов/расходов за последние 6 месяцев
   */
  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    
    // Последние 6 месяцев
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthStats = getStats({
        dateFrom: start,
        dateTo: end,
      });
      
      months.push({
        name: date.toLocaleDateString('ru-RU', { month: 'short' }),
        Доходы: monthStats.income,
        Расходы: monthStats.expense,
      });
    }
    
    return months;
  };

  const expenseData = getExpensesByCategory();
  const monthlyData = getMonthlyData();

  if (accountsLoading || categoriesLoading || operationsLoading) {
    return <Loader text="Загрузка дашборда..." />;
  }

  // Цвета для pie chart
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="dashboard">
      {/* Заголовок */}
      <div className="dashboard-header">
        <h1>Главная</h1>
        <div className="dashboard-period">
          <Button
            variant={period === 'month' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Месяц
          </Button>
          <Button
            variant={period === 'year' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('year')}
          >
            Год
          </Button>
        </div>
      </div>

      {/* Карточки со статистикой */}
      <div className="dashboard-stats">
        <Card className="stat-card stat-card-income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Доходы</div>
            <div className="stat-value">{formatCurrencyShort(stats.income)}</div>
          </div>
        </Card>

        <Card className="stat-card stat-card-expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">Расходы</div>
            <div className="stat-value">{formatCurrencyShort(stats.expense)}</div>
          </div>
        </Card>

        <Card className="stat-card stat-card-total">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-label">Всего на счетах</div>
            <div className="stat-value">{formatCurrencyShort(getTotalBalance())}</div>
          </div>
        </Card>
      </div>

      {/* Графики */}
      <div className="dashboard-charts">
        {/* График доходов/расходов по месяцам */}
        <Card title="Динамика доходов и расходов" className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Доходы" fill="var(--color-success)" />
              <Bar dataKey="Расходы" fill="var(--color-danger)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* График расходов по категориям */}
        <Card title="Топ расходов по категориям" className="chart-card">
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              <p>Нет данных для отображения</p>
            </div>
          )}
        </Card>
      </div>

      {/* Счета */}
      <Card
        title="Мои счета"
        headerAction={
          <Button size="sm" onClick={() => navigate('/accounts/new')}>
            + Добавить
          </Button>
        }
      >
        {accounts.length > 0 ? (
          <div className="accounts-grid">
            {accounts.map(account => {
              const accountType = ACCOUNT_TYPES.find(t => t.id === account.type);
              return (
                <div
                  key={account.id}
                  className="account-item"
                  onClick={() => navigate(`/accounts/${account.id}`)}
                >
                  <div className="account-icon">{accountType?.icon || '💳'}</div>
                  <div className="account-info">
                    <div className="account-name">{account.name}</div>
                    <div className="account-type">{accountType?.label}</div>
                  </div>
                  <div className="account-balance">
                    {formatCurrencyShort(account.balance || 0)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>У вас пока нет счетов</p>
            <Button onClick={() => navigate('/accounts/new')}>
              Создать первый счёт
            </Button>
          </div>
        )}
      </Card>

      {/* Категории */}
      <Card
        title="Категории"
        headerAction={
          <Button size="sm" onClick={() => navigate('/categories/new')}>
            + Добавить
          </Button>
        }
      >
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.slice(0, 8).map(category => {
              const icon = CATEGORY_ICONS.find(i => i.id === category.icon);
              return (
                <div
                  key={category.id}
                  className="category-item"
                  onClick={() => navigate(`/categories/${category.id}`)}
                >
                  <div className="category-icon">{icon?.emoji || '📌'}</div>
                  <div className="category-name">{category.name}</div>
                  <div className={`category-type ${category.type}`}>
                    {category.type === 'income' ? 'Доход' : 'Расход'}
                  </div>
                </div>
              );
            })}
            {categories.length > 8 && (
              <div className="category-item category-more">
                <div className="category-icon">...</div>
                <div className="category-name">Ещё {categories.length - 8}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>У вас пока нет категорий</p>
            <Button onClick={() => navigate('/categories/new')}>
              Создать первую категорию
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
