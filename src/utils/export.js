/**
 * Утилиты для экспорта данных
 */

/**
 * Конвертирует CSV в Blob и скачивает
 * @param {string} csvContent - Содержимое CSV
 * @param {string} filename - Имя файла
 */
export function downloadCSV(csvContent, filename) {
  const BOM = "\uFEFF"; // UTF-8 BOM для корректного отображения кириллицы в Excel
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Экранирует значение для CSV (обработка кавычек и запятых)
 * @param {any} value
 * @returns {string}
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Если есть запятая, кавычка или перевод строки - обертываем в кавычки
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Экспортирует операции в CSV
 * @param {Array} operations - Массив операций
 * @param {Object} options - Опции экспорта
 * @returns {string} CSV содержимое
 */
export function exportOperationsToCSV(operations, options = {}) {
  const { includeBalance = false, dateFormat = "ru" } = options;

  if (!operations || operations.length === 0) {
    return "";
  }

  // Заголовок
  const headers = ["Дата", "Тип", "Сумма", "Счет", "Категория", "Комментарий"];

  if (includeBalance) {
    headers.push("Баланс");
  }

  // Строки данных
  const rows = operations.map((op) => {
    const date = new Date(op.date);
    const formattedDate =
      dateFormat === "ru"
        ? date.toLocaleDateString("ru-RU")
        : date.toISOString().split("T")[0];

    const row = [
      escapeCSV(formattedDate),
      escapeCSV(op.type === "income" ? "Доход" : "Расход"),
      escapeCSV(op.amount),
      escapeCSV(op.accountName || ""),
      escapeCSV(op.categoryName || ""),
      escapeCSV(op.comment || ""),
    ];

    if (includeBalance) {
      row.push(escapeCSV(op.balance || ""));
    }

    return row.join(",");
  });

  // Объединяем все в одну строку
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Экспортирует счета в CSV
 * @param {Array} accounts - Массив счетов
 * @returns {string} CSV содержимое
 */
export function exportAccountsToCSV(accounts) {
  if (!accounts || accounts.length === 0) {
    return "";
  }

  const headers = ["Счет", "Тип", "Баланс"];
  const rows = accounts.map((acc) =>
    [escapeCSV(acc.name), escapeCSV(acc.type), escapeCSV(acc.balance)].join(
      ",",
    ),
  );

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Экспортирует статистику по категориям в CSV
 * @param {Array} stats - Массив статистики
 * @returns {string} CSV содержимое
 */
export function exportStatsToCSV(stats) {
  if (!stats || stats.length === 0) {
    return "";
  }

  const headers = ["Категория", "Тип", "Сумма"];
  const rows = stats.map((stat) =>
    [
      escapeCSV(stat.name),
      escapeCSV(stat.type === "income" ? "Доход" : "Расход"),
      escapeCSV(stat.amount),
    ].join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
