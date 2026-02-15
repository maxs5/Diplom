/**
 * Утилиты для работы с валютой и числами
 * 
 * Функции для форматирования денежных сумм
 */

/**
 * Форматирует число как денежную сумму
 * @param {number} amount - Сумма
 * @param {string} currency - Код валюты (RUB, USD, EUR)
 * @returns {string} Отформатированная сумма
 * 
 * Примеры:
 * formatCurrency(1234.56, 'RUB') → "1 234,56 ₽"
 * formatCurrency(1000, 'USD') → "$1,000.00"
 */
export function formatCurrency(amount, currency = 'RUB') {
  // Проверяем, что amount - это число
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return '0 ₽';
  }
  
  // Настройки форматирования для разных валют
  const currencyConfig = {
    RUB: {
      locale: 'ru-RU',
      symbol: '₽',
      position: 'after', // Символ после числа
    },
    USD: {
      locale: 'en-US',
      symbol: '$',
      position: 'before', // Символ перед числом
    },
    EUR: {
      locale: 'de-DE',
      symbol: '€',
      position: 'after',
    },
  };
  
  const config = currencyConfig[currency] || currencyConfig.RUB;
  
  // Форматируем число с разделителями тысяч
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  
  // Добавляем символ валюты
  if (config.position === 'before') {
    return `${config.symbol}${formatted}`;
  } else {
    return `${formatted} ${config.symbol}`;
  }
}

/**
 * Форматирует число как целую денежную сумму (без копеек)
 * @param {number} amount - Сумма
 * @param {string} currency - Код валюты
 * @returns {string} Отформатированная сумма
 * 
 * Пример: formatCurrencyShort(1234.56, 'RUB') → "1 235 ₽"
 */
export function formatCurrencyShort(amount, currency = 'RUB') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return '0 ₽';
  }
  
  const currencySymbols = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
  };
  
  const symbol = currencySymbols[currency] || '₽';
  const rounded = Math.round(num);
  const formatted = rounded.toLocaleString('ru-RU');
  
  return `${formatted} ${symbol}`;
}

/**
 * Форматирует большие числа с сокращениями
 * @param {number} amount - Сумма
 * @returns {string} Сокращенная сумма
 * 
 * Примеры:
 * formatCompactCurrency(1234) → "1,2K ₽"
 * formatCompactCurrency(1234567) → "1,2M ₽"
 */
export function formatCompactCurrency(amount, currency = 'RUB') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return '0 ₽';
  }
  
  const symbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€';
  
  // Миллиарды
  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B ${symbol}`;
  }
  
  // Миллионы
  if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M ${symbol}`;
  }
  
  // Тысячи
  if (Math.abs(num) >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K ${symbol}`;
  }
  
  return formatCurrencyShort(num, currency);
}

/**
 * Парсит строку в число
 * @param {string} value - Строка с числом
 * @returns {number|null} Число или null
 * 
 * Примеры:
 * parseAmount('1 234,56') → 1234.56
 * parseAmount('1,234.56') → 1234.56
 */
export function parseAmount(value) {
  if (!value) return null;
  
  // Убираем все пробелы
  let cleaned = value.replace(/\s/g, '');
  
  // Заменяем запятую на точку (для русского формата)
  cleaned = cleaned.replace(',', '.');
  
  // Парсим число
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Форматирует процент
 * @param {number} value - Значение процента
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} Отформатированный процент
 * 
 * Пример: formatPercent(0.2567, 1) → "25,7%"
 */
export function formatPercent(value, decimals = 1) {
  if (isNaN(value)) return '0%';
  
  const percent = value * 100;
  return `${percent.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Вычисляет процентное изменение
 * @param {number} oldValue - Старое значение
 * @param {number} newValue - Новое значение
 * @returns {number} Процент изменения (0.25 = 25%)
 * 
 * Пример: getPercentChange(100, 125) → 0.25 (рост на 25%)
 */
export function getPercentChange(oldValue, newValue) {
  if (oldValue === 0) return newValue > 0 ? 1 : 0;
  return (newValue - oldValue) / oldValue;
}

/**
 * Добавляет знак к числу (+ или -)
 * @param {number} value - Число
 * @returns {string} Число со знаком
 * 
 * Примеры:
 * addSignToNumber(100) → "+100"
 * addSignToNumber(-50) → "-50"
 */
export function addSignToNumber(value) {
  if (value > 0) return `+${value}`;
  return value.toString();
}

/**
 * Округляет число до двух знаков после запятой
 * @param {number} value - Число
 * @returns {number} Округленное число
 */
export function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Проверяет, является ли строка валидной суммой
 * @param {string} value - Строка для проверки
 * @returns {boolean}
 */
export function isValidAmount(value) {
  const parsed = parseAmount(value);
  return parsed !== null && parsed > 0;
}
