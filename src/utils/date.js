/**
 * Утилиты для работы с датами
 * 
 * Набор функций для форматирования и обработки дат в приложении
 */

/**
 * Форматирует дату в читаемый формат
 * @param {Date|string} date - Дата для форматирования
 * @param {string} format - Формат вывода ('short', 'long', 'time')
 * @returns {string} Отформатированная дата
 * 
 * Примеры:
 * formatDate(new Date(), 'short') → "03.02.2026"
 * formatDate(new Date(), 'long') → "3 февраля 2026"
 * formatDate(new Date(), 'time') → "15:30"
 */
export function formatDate(date, format = 'short') {
  // Преобразуем строку в объект Date, если нужно
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Проверяем, что дата валидна
  if (!d || isNaN(d.getTime())) {
    return '-';
  }
  
  // Выбираем нужный формат
  switch (format) {
    case 'short':
      // Короткий формат: 03.02.2026
      return d.toLocaleDateString('ru-RU');
      
    case 'long':
      // Длинный формат: 3 февраля 2026
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
    case 'time':
      // Только время: 15:30
      return d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
    case 'datetime':
      // Дата и время: 03.02.2026, 15:30
      return `${d.toLocaleDateString('ru-RU')}, ${d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
      
    default:
      return d.toLocaleDateString('ru-RU');
  }
}

/**
 * Получает начало дня для даты
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата с временем 00:00:00
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Получает конец дня для даты
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата с временем 23:59:59
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Получает начало недели (понедельник)
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата начала недели
 */
export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = воскресенье, 1 = понедельник, ...
  const diff = day === 0 ? -6 : 1 - day; // Смещение к понедельнику
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Получает конец недели (воскресенье)
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата конца недели
 */
export function endOfWeek(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6); // Добавляем 6 дней к понедельнику
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Получает начало месяца
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата начала месяца
 */
export function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1); // Первое число месяца
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Получает конец месяца
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата конца месяца
 */
export function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1); // Переходим к следующему месяцу
  d.setDate(0); // Нулевой день = последний день предыдущего месяца
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Получает начало года
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата начала года
 */
export function startOfYear(date) {
  const d = new Date(date);
  d.setMonth(0); // Январь
  d.setDate(1); // Первое число
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Получает конец года
 * @param {Date} date - Исходная дата
 * @returns {Date} Дата конца года
 */
export function endOfYear(date) {
  const d = new Date(date);
  d.setMonth(11); // Декабрь
  d.setDate(31); // 31 число
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Добавляет дни к дате
 * @param {Date} date - Исходная дата
 * @param {number} days - Количество дней (может быть отрицательным)
 * @returns {Date} Новая дата
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Добавляет месяцы к дате
 * @param {Date} date - Исходная дата
 * @param {number} months - Количество месяцев
 * @returns {Date} Новая дата
 */
export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Проверяет, входит ли дата в диапазон
 * @param {Date} date - Проверяемая дата
 * @param {Date} start - Начало диапазона
 * @param {Date} end - Конец диапазона
 * @returns {boolean}
 */
export function isDateInRange(date, start, end) {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
}

/**
 * Получает относительное описание даты
 * @param {Date|string} date - Дата
 * @returns {string} "Сегодня", "Вчера", "3 дня назад" и т.д.
 */
export function getRelativeTimeString(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Вчера';
  } else if (diffDays < 7) {
    return `${diffDays} ${getDayWord(diffDays)} назад`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${getWeekWord(weeks)} назад`;
  } else {
    return formatDate(d, 'short');
  }
}

/**
 * Склонение слова "день"
 * @param {number} n - Количество дней
 * @returns {string} "день", "дня" или "дней"
 */
function getDayWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'дня';
  return 'дней';
}

/**
 * Склонение слова "неделя"
 * @param {number} n - Количество недель
 * @returns {string} "неделю", "недели" или "недель"
 */
function getWeekWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'неделю';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'недели';
  return 'недель';
}

/**
 * Конвертирует дату в формат для input[type="date"]
 * @param {Date} date - Дата
 * @returns {string} Строка формата YYYY-MM-DD
 */
export function toInputDateFormat(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Получает название месяца
 * @param {number} monthIndex - Индекс месяца (0-11)
 * @returns {string} Название месяца
 */
export function getMonthName(monthIndex) {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[monthIndex] || '';
}
