/**
 * Утилиты для работы с паролями
 * Предостережение: это простое хеширование на клиенте
 * В production используйте backend с bcrypt или argon2
 */

/**
 * Простое хеширование пароля (djb2 алгоритм)
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) + hash + password.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Проверка пароля
 * @param {string} password
 * @param {string} hash
 * @returns {boolean}
 */
export function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Генерирует случайный соль
 * @returns {string}
 */
export function generateSalt() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Хеширование с солью
 * @param {string} password
 * @param {string} salt
 * @returns {string}
 */
export function hashPasswordWithSalt(password, salt) {
  return hashPassword(password + salt);
}
