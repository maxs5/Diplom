/**
 * Константы приложения
 *
 * Здесь хранятся все неизменяемые данные:
 * - Типы счетов и категорий
 * - Иконки
 * - Настройки пагинации
 */

// ============================================
// ТИПЫ СЧЕТОВ (какие виды счетов может создать пользователь)
// ============================================
export const ACCOUNT_TYPES = [
  { id: "card", label: "Дебетовая карта", icon: "💳" },
  { id: "cash", label: "Наличные", icon: "💵" },
  { id: "deposit", label: "Вклад", icon: "🏦" },
  { id: "credit", label: "Кредитная карта", icon: "💰" },
  { id: "savings", label: "Накопительный счёт", icon: "🐷" },
  { id: "investment", label: "Инвестиционный счёт", icon: "📈" },
];

// ============================================
// ТИПЫ КАТЕГОРИЙ (доход или расход)
// ============================================
export const CATEGORY_TYPES = [
  { id: "expense", label: "Расход", color: "var(--color-danger)" },
  { id: "income", label: "Доход", color: "var(--color-success)" },
];

// ============================================
// ИКОНКИ ДЛЯ КАТЕГОРИЙ
// Пользователь может выбрать любую иконку для своей категории
// ============================================
export const CATEGORY_ICONS = [
  // Еда и напитки
  { id: "food", emoji: "🍕", label: "Еда" },
  { id: "coffee", emoji: "☕", label: "Кофе" },
  { id: "restaurant", emoji: "🍽️", label: "Ресторан" },
  { id: "grocery", emoji: "🛒", label: "Продукты" },

  // Транспорт
  { id: "car", emoji: "🚗", label: "Автомобиль" },
  { id: "bus", emoji: "🚌", label: "Общественный транспорт" },
  { id: "taxi", emoji: "🚕", label: "Такси" },
  { id: "plane", emoji: "✈️", label: "Самолёт" },
  { id: "gas", emoji: "⛽", label: "Бензин" },

  // Дом
  { id: "home", emoji: "🏠", label: "Дом" },
  { id: "rent", emoji: "🏘️", label: "Аренда" },
  { id: "utilities", emoji: "💡", label: "Коммунальные услуги" },
  { id: "furniture", emoji: "🛋️", label: "Мебель" },

  // Развлечения
  { id: "movie", emoji: "🎬", label: "Кино" },
  { id: "game", emoji: "🎮", label: "Игры" },
  { id: "music", emoji: "🎵", label: "Музыка" },
  { id: "sport", emoji: "⚽", label: "Спорт" },
  { id: "travel", emoji: "🌍", label: "Путешествия" },

  // Покупки
  { id: "shopping", emoji: "🛍️", label: "Покупки" },
  { id: "clothes", emoji: "👕", label: "Одежда" },
  { id: "electronics", emoji: "💻", label: "Электроника" },
  { id: "gift", emoji: "🎁", label: "Подарки" },

  // Здоровье
  { id: "health", emoji: "🏥", label: "Здоровье" },
  { id: "medicine", emoji: "💊", label: "Лекарства" },
  { id: "fitness", emoji: "💪", label: "Фитнес" },

  // Образование
  { id: "education", emoji: "📚", label: "Образование" },
  { id: "book", emoji: "📖", label: "Книги" },

  // Работа и доходы
  { id: "salary", emoji: "💼", label: "Зарплата" },
  { id: "business", emoji: "📊", label: "Бизнес" },
  { id: "investment", emoji: "📈", label: "Инвестиции" },
  { id: "freelance", emoji: "💻", label: "Фриланс" },

  // Другое
  { id: "pet", emoji: "🐶", label: "Питомцы" },
  { id: "child", emoji: "👶", label: "Дети" },
  { id: "phone", emoji: "📱", label: "Связь" },
  { id: "internet", emoji: "🌐", label: "Интернет" },
  { id: "subscription", emoji: "📺", label: "Подписки" },
  { id: "insurance", emoji: "🛡️", label: "Страхование" },
  { id: "tax", emoji: "📝", label: "Налоги" },
  { id: "other", emoji: "📌", label: "Другое" },
];

// ============================================
// НАСТРОЙКИ ПАГИНАЦИИ
// ============================================
export const PAGINATION_CONFIG = {
  defaultPageSize: 10, // Сколько операций показывать на одной странице
  pageSizeOptions: [5, 10, 20, 50], // Варианты количества элементов
};

// ============================================
// ПЕРИОДЫ ДЛЯ ФИЛЬТРАЦИИ (для аналитики)
// ============================================
export const DATE_PERIODS = [
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "quarter", label: "Квартал" },
  { id: "year", label: "Год" },
  { id: "custom", label: "Произвольный период" },
];

// ============================================
// ТИПЫ ОПЕРАЦИЙ
// ============================================
export const OPERATION_TYPES = {
  INCOME: "income", // Доход
  EXPENSE: "expense", // Расход
};

// ============================================
// КЛЮЧИ ДЛЯ LOCALSTORAGE
// Используются для сохранения данных в браузере
// ============================================
export const STORAGE_KEYS = {
  USER: "financeApp_user",
  ACCOUNTS: "financeApp_accounts",
  CATEGORIES: "financeApp_categories",
  OPERATIONS: "financeApp_operations",
  RECURRING: "financeApp_recurring",
  BUDGETS: "financeApp_budgets",
};

// ============================================
// ВАЛЮТЫ (можно расширить)
// ============================================
export const CURRENCIES = [
  { id: "RUB", symbol: "₽", label: "Российский рубль" },
  { id: "USD", symbol: "$", label: "Доллар США" },
  { id: "EUR", symbol: "€", label: "Евро" },
];

// ============================================
// ДЕФОЛТНЫЕ КАТЕГОРИИ
// Создаются автоматически для нового пользователя
// ============================================
export const DEFAULT_CATEGORIES = [
  // Расходы
  { name: "Продукты", type: "expense", icon: "grocery" },
  { name: "Транспорт", type: "expense", icon: "bus" },
  { name: "Развлечения", type: "expense", icon: "movie" },
  { name: "Коммунальные", type: "expense", icon: "utilities" },
  { name: "Здоровье", type: "expense", icon: "health" },

  // Доходы
  { name: "Зарплата", type: "income", icon: "salary" },
  { name: "Фриланс", type: "income", icon: "freelance" },
  { name: "Другое", type: "income", icon: "other" },
];
