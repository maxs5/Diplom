/**
 * Страница авторизации и регистрации
 *
 * Позволяет пользователю:
 * - Войти в существующий аккаунт
 * - Зарегистрировать новый аккаунт
 */

import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { toast } from "sonner";
import "./AuthPage.css";

export function AuthPage() {
  // Получаем функции авторизации из контекста
  const { login, register, isAuthenticated } = useAuth();

  // Переключатель между формой входа и регистрации
  const [isLogin, setIsLogin] = useState(true);

  // Состояние формы
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Ошибки валидации
  const [errors, setErrors] = useState({});

  // Флаг загрузки (показываем при отправке формы)
  const [loading, setLoading] = useState(false);

  // Если пользователь уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * Валидация формы
   */
  const validate = () => {
    const newErrors = {};

    // Email обязателен
    if (!formData.email) {
      newErrors.email = "Введите email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    // Пароль обязателен
    if (!formData.password) {
      newErrors.password = "Введите пароль";
    } else if (formData.password.length < 6) {
      newErrors.password = "Минимум 6 символов";
    }

    // Имя обязательно только при регистрации
    if (!isLogin && !formData.name) {
      newErrors.name = "Введите имя";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Отправка формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидируем
    if (!validate()) {
      return;
    }

    setLoading(true);

    // Небольшая задержка для UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Вход или регистрация
    const result = await (isLogin
      ? login(formData.email, formData.password)
      : register(formData));

    setLoading(false);

    // Обрабатываем результат
    if (result.success) {
      toast.success(isLogin ? "Добро пожаловать!" : "Регистрация успешна!");
    } else {
      toast.error(result.error || "Произошла ошибка");
    }
  };

  /**
   * Переключение между входом и регистрацией
   */
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      name: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Логотип/название приложения */}
        <div className="auth-header">
          <div className="auth-logo">💰</div>
          <h1 className="auth-title">Finance App</h1>
          <p className="auth-subtitle">
            {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
          </p>
        </div>

        {/* Форма */}
        <Card>
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Имя (только при регистрации) */}
            {!isLogin && (
              <Input
                label="Имя"
                type="text"
                name="name"
                placeholder="Введите ваше имя"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                icon={<span>👤</span>}
              />
            )}

            {/* Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              icon={<span>✉️</span>}
            />

            {/* Пароль */}
            <Input
              label="Пароль"
              type="password"
              name="password"
              placeholder="Минимум 6 символов"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              icon={<span>🔒</span>}
            />

            {/* Кнопка отправки */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
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
                  {isLogin ? "Входим..." : "Регистрируем..."}
                </span>
              ) : isLogin ? (
                "Войти"
              ) : (
                "Зарегистрироваться"
              )}
            </Button>
          </form>
        </Card>

        {/* Переключатель режима */}
        <div className="auth-toggle">
          <span className="auth-toggle-text">
            {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="auth-toggle-button"
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>

        {/* Демо-данные для тестирования */}
        <div className="auth-demo">
          <p className="auth-demo-title">Для тестирования:</p>
          <p className="auth-demo-text">
            Email: demo@test.com
            <br />
            Пароль: 123456
          </p>
        </div>
      </div>
    </div>
  );
}
