/**
 * Страница формы категории (создание/редактирование)
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useCategories } from "../features/categories/CategoriesContext.jsx";
import { Loader } from "../components/common/Loader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { CATEGORY_ICONS } from "../data/constants.js";
import "./CategoryFormPage.css";

export function CategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    loading,
  } = useCategories();

  // Состояние формы
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: "other",
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
      const category = getCategoryById(id);
      if (category) {
        setFormData({
          name: category.name,
          type: category.type,
          icon: category.icon || "other",
        });
      } else {
        toast.error("Категория не найдена");
        navigate("/");
      }
    }
  }, [id, isEdit, loading, getCategoryById, navigate]);

  if (loading) {
    return <Loader text="Загрузка формы категории..." />;
  }

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
      newErrors.name = "Введите название категории";
    }

    if (!formData.type) {
      newErrors.type = "Выберите тип категории";
    }

    if (!formData.icon) {
      newErrors.icon = "Выберите иконку";
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
      toast.error("Заполните все поля");
      return;
    }

    const result = isEdit
      ? updateCategory(id, formData)
      : createCategory(formData);

    if (result.success) {
      toast.success(isEdit ? "Категория обновлена" : "Категория создана");
      navigate("/");
    } else {
      toast.error(result.error);
    }
  };

  /**
   * Удаление категории
   */
  const handleDelete = () => {
    if (window.confirm("Вы уверены? Это действие нельзя отменить.")) {
      const result = deleteCategory(id);
      if (result.success) {
        toast.success("Категория удалена");
        navigate("/");
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="category-form-page">
      <div className="form-header">
        <h1>{isEdit ? "Редактировать категорию" : "Новая категория"}</h1>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Отмена
        </Button>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit} className="category-form">
          {/* Название */}
          <Input
            label="Название категории"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Например: Продукты"
            error={errors.name}
            required
            icon={<span>🏷️</span>}
          />

          {/* Тип */}
          <Select
            label="Тип категории"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            options={[
              { value: "expense", label: "💸 Расход" },
              { value: "income", label: "💰 Доход" },
            ]}
            error={errors.type}
            required
          />

          {/* Иконка */}
          <div className="icon-selector">
            <label className="form-label">Иконка категории</label>
            <div className="icons-grid">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  className={`icon-option ${formData.icon === icon.id ? "icon-selected" : ""}`}
                  onClick={() => handleChange("icon", icon.id)}
                  title={icon.label}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="form-actions">
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete}>
                Удалить
              </Button>
            )}
            <div style={{ flex: 1 }} />
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/")}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
