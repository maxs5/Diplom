/**
 * Страница формы операции (создание/редактирование)
 * 
 * Позволяет:
 * - Создать новую операцию
 * - Редактировать существующую
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useOperations } from '../features/operations/OperationsContext.jsx';
import { useAccounts } from '../features/accounts/AccountsContext.jsx';
import { useCategories } from '../features/categories/CategoriesContext.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { toInputDateFormat } from '../utils/date.js';
import './OperationFormPage.css';

export function OperationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID операции (если редактирование)
  const isEdit = !!id;

  const { createOperation, updateOperation, getOperationById, loading: operationsLoading } = useOperations();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { getIncomeCategories, getExpenseCategories, loading: categoriesLoading } = useCategories();

  // Состояние формы
  const [formData, setFormData] = useState({
    type: 'expense', // По умолчанию расход
    accountId: '',
    categoryId: '',
    amount: '',
    date: toInputDateFormat(new Date()),
    comment: '',
  });

  // Ошибки валидации
  const [errors, setErrors] = useState({});

  /**
   * Загружаем данные операции при редактировании
   */
  useEffect(() => {
    if (operationsLoading) {
      return;
    }

    if (isEdit) {
      const operation = getOperationById(id);
      if (operation) {
        setFormData({
          type: operation.type,
          accountId: operation.accountId,
          categoryId: operation.categoryId,
          amount: operation.amount.toString(),
          date: operation.date.split('T')[0], // Только дата
          comment: operation.comment || '',
        });
      } else {
        toast.error('Операция не найдена');
        navigate('/operations');
      }
    }
  }, [id, isEdit, operationsLoading, getOperationById, navigate]);

  /**
   * Обработчик изменения полей
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // При смене типа сбрасываем категорию
    if (field === 'type') {
      setFormData(prev => ({ ...prev, categoryId: '' }));
    }
  };

  /**
   * Валидация формы
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Выберите тип операции';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Выберите счёт';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Выберите категорию';
    }

    if (!formData.amount) {
      newErrors.amount = 'Введите сумму';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Сумма должна быть больше 0';
    }

    if (!formData.date) {
      newErrors.date = 'Выберите дату';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Отправка формы
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    // Создаём или обновляем операцию
    const result = isEdit
      ? updateOperation(id, formData)
      : createOperation(formData);

    if (result.success) {
      toast.success(isEdit ? 'Операция обновлена' : 'Операция создана');
      navigate('/operations');
    } else {
      toast.error(result.error);
    }
  };

  /**
   * Получаем категории в зависимости от типа
   */
  const availableCategories = formData.type === 'income'
    ? getIncomeCategories()
    : getExpenseCategories();

  if (operationsLoading || accountsLoading || categoriesLoading) {
    return <Loader text="Загрузка формы операции..." />;
  }

  return (
    <div className="operation-form-page">
      <div className="form-header">
        <h1>{isEdit ? 'Редактировать операцию' : 'Новая операция'}</h1>
        <Button variant="secondary" onClick={() => navigate('/operations')}>
          Отмена
        </Button>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit} className="operation-form">
          {/* Тип операции */}
          <Select
            label="Тип операции"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={[
              { value: 'expense', label: '💸 Расход' },
              { value: 'income', label: '💰 Доход' },
            ]}
            error={errors.type}
            required
          />

          {/* Счёт */}
          <Select
            label="Счёт"
            value={formData.accountId}
            onChange={(e) => handleChange('accountId', e.target.value)}
            options={accounts.map(acc => ({
              value: acc.id,
              label: acc.name,
            }))}
            placeholder="Выберите счёт"
            error={errors.accountId}
            required
          />

          {/* Категория */}
          <Select
            label="Категория"
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            options={availableCategories.map(cat => ({
              value: cat.id,
              label: cat.name,
            }))}
            placeholder="Выберите категорию"
            error={errors.categoryId}
            required
          />

          {/* Сумма */}
          <Input
            label="Сумма"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="0.00"
            error={errors.amount}
            required
            icon={<span>₽</span>}
          />

          {/* Дата */}
          <Input
            label="Дата"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={errors.date}
            required
            icon={<span>📅</span>}
          />

          {/* Комментарий */}
          <div className="form-field-full">
            <label className="form-label">Комментарий (необязательно)</label>
            <textarea
              className="form-textarea"
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              placeholder="Добавьте заметку..."
              rows={4}
            />
          </div>

          {/* Кнопки */}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/operations')}>
              Отмена
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
