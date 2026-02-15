/**
 * Страница формы счёта (создание/редактирование)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAccounts } from '../features/accounts/AccountsContext.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { ACCOUNT_TYPES } from '../data/constants.js';
import './OperationFormPage.css'; // Используем те же стили

export function AccountFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { createAccount, updateAccount, deleteAccount, getAccountById, loading } = useAccounts();

  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    type: 'card',
    initialBalance: '0',
  });

  const [errors, setErrors] = useState({});

  /**
   * Загружаем данные при редактировании
   */
  useEffect(() => {
    if (loading) {
      return;
    }

    if (isEdit) {
      const account = getAccountById(id);
      if (account) {
        setFormData({
          name: account.name,
          type: account.type,
          initialBalance: account.balance?.toString() || '0',
        });
      } else {
        toast.error('Счёт не найден');
        navigate('/');
      }
    }
  }, [id, isEdit, loading, getAccountById, navigate]);

  if (loading) {
    return <Loader text="Загрузка формы счёта..." />;
  }

  /**
   * Обработчик изменения
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Валидация
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название счёта';
    }

    if (!formData.type) {
      newErrors.type = 'Выберите тип счёта';
    }

    if (formData.initialBalance === '') {
      newErrors.initialBalance = 'Введите начальный баланс';
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
      toast.error('Заполните все поля');
      return;
    }

    const result = isEdit
      ? updateAccount(id, formData)
      : createAccount(formData);

    if (result.success) {
      toast.success(isEdit ? 'Счёт обновлён' : 'Счёт создан');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  /**
   * Удаление счёта
   */
  const handleDelete = () => {
    if (window.confirm('Вы уверены? Это действие нельзя отменить.')) {
      const result = deleteAccount(id);
      if (result.success) {
        toast.success('Счёт удалён');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="operation-form-page">
      <div className="form-header">
        <h1>{isEdit ? 'Редактировать счёт' : 'Новый счёт'}</h1>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Отмена
        </Button>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit} className="operation-form">
          {/* Название */}
          <Input
            label="Название счёта"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Например: Основная карта"
            error={errors.name}
            required
            icon={<span>💳</span>}
          />

          {/* Тип */}
          <Select
            label="Тип счёта"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={ACCOUNT_TYPES.map(type => ({
              value: type.id,
              label: `${type.icon} ${type.label}`,
            }))}
            error={errors.type}
            required
          />

          {/* Начальный баланс (только при создании) */}
          {!isEdit && (
            <Input
              label="Начальный баланс"
              type="number"
              step="0.01"
              value={formData.initialBalance}
              onChange={(e) => handleChange('initialBalance', e.target.value)}
              placeholder="0.00"
              error={errors.initialBalance}
              required
              icon={<span>₽</span>}
            />
          )}

          {/* Кнопки */}
          <div className="form-actions">
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete}>
                Удалить
              </Button>
            )}
            <div style={{ flex: 1 }} />
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
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
