/**
 * Страница настроек
 *
 * Позволяет пользователю:
 * - Изменить имя
 * - Изменить email
 * - Выбрать валюту
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { CURRENCIES } from "../data/constants.js";
import { STORAGE_KEYS } from "../data/constants.js";
import "./SettingsPage.css";

export function SettingsPage() {
  const { user, updateProfile } = useAuth();

  // Состояние формы
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currency: user?.currency || "RUB",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  /**
   * Обработчик изменения
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Валидация
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Введите имя";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Сохранение изменений
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Исправьте ошибки в форме");
      return;
    }

    setLoading(true);

    // Небольшая задержка для UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await updateProfile(formData);

    setLoading(false);

    if (result.success) {
      toast.success("Настройки сохранены");
    } else {
      toast.error(result.error || "Не удалось сохранить настройки");
    }
  };

  const handleResetData = () => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      "Удалить все ваши счета, категории, операции, бюджеты и автоплатежи?",
    );
    if (!confirmed) return;

    setResetLoading(true);

    try {
      const keysToClear = [
        STORAGE_KEYS.ACCOUNTS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.OPERATIONS,
        STORAGE_KEYS.BUDGETS,
        STORAGE_KEYS.RECURRING,
      ];

      keysToClear.forEach((key) => {
        const allItems = JSON.parse(localStorage.getItem(key) || "[]");
        const onlyOtherUsers = allItems.filter(
          (item) => item.userId !== user.id,
        );
        localStorage.setItem(key, JSON.stringify(onlyOtherUsers));
      });

      window.dispatchEvent(new Event("finance:accounts-sync"));
      window.dispatchEvent(new Event("finance:categories-sync"));
      window.dispatchEvent(new Event("finance:operations-sync"));
      window.dispatchEvent(new Event("finance:budgets-sync"));
      window.dispatchEvent(new Event("finance:recurring-sync"));

      toast.success("Данные очищены");
    } catch (error) {
      console.error("Ошибка очистки данных:", error);
      toast.error("Не удалось очистить данные");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Настройки</h1>

      <div className="settings-content">
        {/* Личные данные */}
        <Card title="Личные данные" className="settings-card">
          <form onSubmit={handleSubmit} className="settings-form">
            {/* Имя */}
            <Input
              label="Имя"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              required
              icon={<span>👤</span>}
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              required
              icon={<span>✉️</span>}
            />

            {/* Валюта */}
            <Select
              label="Валюта"
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              options={CURRENCIES.map((curr) => ({
                value: curr.id,
                label: `${curr.symbol} ${curr.label}`,
              }))}
            />

            {/* Кнопка сохранения */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Spinner size="sm" />
                  Сохранение...
                </span>
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          </form>
        </Card>

        {/* Информация об аккаунте */}
        <Card title="Информация об аккаунте" className="settings-card">
          <div className="account-info">
            <div className="info-item">
              <span className="info-label">ID пользователя:</span>
              <span className="info-value">{user?.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
        </Card>

        <Card title="Опасная зона" className="settings-card">
          <Button
            type="button"
            variant="danger"
            disabled={resetLoading}
            onClick={handleResetData}
            fullWidth
          >
            {resetLoading ? "Очистка..." : "Очистить все мои данные"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
