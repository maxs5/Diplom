/**
 * Утилиты для валидации форм
 * 
 * Набор функций для проверки корректности данных
 */

/**
 * Проверка email
 * @param {string} email - Email для проверки
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Проверка пароля
 * @param {string} password - Пароль для проверки
 * @param {number} minLength - Минимальная длина
 * @returns {boolean}
 */
export function isValidPassword(password, minLength = 6) {
  return password && password.length >= minLength;
}

/**
 * Проверка обязательного поля
 * @param {string} value - Значение для проверки
 * @returns {boolean}
 */
export function isRequired(value) {
  return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Проверка числа
 * @param {any} value - Значение для проверки
 * @returns {boolean}
 */
export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Проверка положительного числа
 * @param {any} value - Значение для проверки
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
  return isNumber(value) && parseFloat(value) > 0;
}

/**
 * Проверка минимального значения
 * @param {any} value - Значение для проверки
 * @param {number} min - Минимальное значение
 * @returns {boolean}
 */
export function isMinValue(value, min) {
  return isNumber(value) && parseFloat(value) >= min;
}

/**
 * Проверка максимального значения
 * @param {any} value - Значение для проверки
 * @param {number} max - Максимальное значение
 * @returns {boolean}
 */
export function isMaxValue(value, max) {
  return isNumber(value) && parseFloat(value) <= max;
}

/**
 * Проверка минимальной длины строки
 * @param {string} value - Строка для проверки
 * @param {number} minLength - Минимальная длина
 * @returns {boolean}
 */
export function isMinLength(value, minLength) {
  return value && value.length >= minLength;
}

/**
 * Проверка максимальной длины строки
 * @param {string} value - Строка для проверки
 * @param {number} maxLength - Максимальная длина
 * @returns {boolean}
 */
export function isMaxLength(value, maxLength) {
  return value && value.length <= maxLength;
}

/**
 * Проверка даты
 * @param {string} dateString - Дата в формате строки
 * @returns {boolean}
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Проверка, что дата не в будущем
 * @param {string} dateString - Дата в формате строки
 * @returns {boolean}
 */
export function isNotFutureDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return date <= now;
}

/**
 * Валидатор формы
 * Применяет правила валидации к объекту
 * 
 * @param {Object} data - Данные формы
 * @param {Object} rules - Правила валидации
 * @returns {Object} Объект с ошибками
 * 
 * Пример:
 * const errors = validateForm(
 *   { email: 'test', password: '123' },
 *   {
 *     email: [
 *       { rule: isRequired, message: 'Email обязателен' },
 *       { rule: isValidEmail, message: 'Некорректный email' }
 *     ],
 *     password: [
 *       { rule: isRequired, message: 'Пароль обязателен' },
 *       { rule: (val) => isMinLength(val, 6), message: 'Минимум 6 символов' }
 *     ]
 *   }
 * );
 */
export function validateForm(data, rules) {
  const errors = {};
  
  for (const field in rules) {
    const fieldRules = rules[field];
    const value = data[field];
    
    for (const { rule, message } of fieldRules) {
      if (!rule(value)) {
        errors[field] = message;
        break; // Прерываем на первой ошибке для этого поля
      }
    }
  }
  
  return errors;
}

/**
 * Очистка значения (trim)
 * @param {any} value - Значение для очистки
 * @returns {any}
 */
export function sanitize(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

/**
 * Очистка всех полей объекта
 * @param {Object} data - Объект с данными
 * @returns {Object} Очищенный объект
 */
export function sanitizeObject(data) {
  const sanitized = {};
  for (const key in data) {
    sanitized[key] = sanitize(data[key]);
  }
  return sanitized;
}
