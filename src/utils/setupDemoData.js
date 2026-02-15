/**
 * Создание демо-данных для тестирования
 *
 * Создаёт тестового пользователя с примерами данных
 */

import { STORAGE_KEYS, DEFAULT_CATEGORIES } from "../data/constants.js";
import { hashPasswordWithSalt, generateSalt } from "./password.js";

/**
 * Создать демо-пользователя
 */
export function setupDemoUser() {
  // Проверяем, есть ли уже демо-пользователь
  const users = JSON.parse(localStorage.getItem("financeApp_users") || "[]");
  const demoExists = users.find((u) => u.email === "demo@test.com");

  if (demoExists) {
    console.log("Демо-пользователь уже существует");
    return;
  }

  // Генерируем соль и хешируем пароль для демо-пользователя
  const demoSalt = generateSalt();
  const demoPasswordHash = hashPasswordWithSalt("123456", demoSalt);

  // Создаём демо-пользователя
  const demoUser = {
    id: "demo_user_1",
    email: "demo@test.com",
    passwordHash: demoPasswordHash,
    passwordSalt: demoSalt,
    name: "Демо Пользователь",
    currency: "RUB",
    createdAt: new Date().toISOString(),
  };

  users.push(demoUser);
  localStorage.setItem("financeApp_users", JSON.stringify(users));

  // Создаём категории
  const categories = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]",
  );

  const demoCategories = [
    { name: "Зарплата", type: "income", icon: "salary" },
    { name: "Фриланс", type: "income", icon: "freelance" },
    { name: "Продукты", type: "expense", icon: "grocery" },
    { name: "Транспорт", type: "expense", icon: "bus" },
    { name: "Развлечения", type: "expense", icon: "movie" },
    { name: "Кафе и рестораны", type: "expense", icon: "restaurant" },
    { name: "Здоровье", type: "expense", icon: "health" },
    { name: "Коммунальные", type: "expense", icon: "utilities" },
  ].map((cat, idx) => ({
    id: `demo_cat_${idx}`,
    userId: demoUser.id,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
    createdAt: new Date().toISOString(),
  }));

  categories.push(...demoCategories);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

  // Создаём счета
  const accounts = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || "[]",
  );

  const demoAccounts = [
    { name: "Основная карта", type: "card", balance: 45000 },
    { name: "Наличные", type: "cash", balance: 5000 },
    { name: "Накопления", type: "savings", balance: 120000 },
  ].map((acc, idx) => ({
    id: `demo_acc_${idx}`,
    userId: demoUser.id,
    name: acc.name,
    type: acc.type,
    balance: acc.balance,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  accounts.push(...demoAccounts);
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

  // Создаём операции за последние 3 месяца
  const operations = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.OPERATIONS) || "[]",
  );
  const now = new Date();

  const demoOperations = [
    // Доходы
    {
      type: "income",
      categoryId: demoCategories[0].id,
      accountId: demoAccounts[0].id,
      amount: 80000,
      daysAgo: 5,
      comment: "Зарплата за январь",
    },
    {
      type: "income",
      categoryId: demoCategories[1].id,
      accountId: demoAccounts[0].id,
      amount: 15000,
      daysAgo: 10,
      comment: "Проект на фрилансе",
    },
    {
      type: "income",
      categoryId: demoCategories[0].id,
      accountId: demoAccounts[0].id,
      amount: 80000,
      daysAgo: 35,
      comment: "Зарплата за декабрь",
    },

    // Расходы - продукты
    {
      type: "expense",
      categoryId: demoCategories[2].id,
      accountId: demoAccounts[0].id,
      amount: 5200,
      daysAgo: 1,
      comment: "Продукты на неделю",
    },
    {
      type: "expense",
      categoryId: demoCategories[2].id,
      accountId: demoAccounts[1].id,
      amount: 1500,
      daysAgo: 3,
      comment: "Магазин у дома",
    },
    {
      type: "expense",
      categoryId: demoCategories[2].id,
      accountId: demoAccounts[0].id,
      amount: 4800,
      daysAgo: 8,
      comment: "",
    },
    {
      type: "expense",
      categoryId: demoCategories[2].id,
      accountId: demoAccounts[0].id,
      amount: 6100,
      daysAgo: 15,
      comment: "",
    },
    {
      type: "expense",
      categoryId: demoCategories[2].id,
      accountId: demoAccounts[0].id,
      amount: 5500,
      daysAgo: 22,
      comment: "",
    },

    // Расходы - транспорт
    {
      type: "expense",
      categoryId: demoCategories[3].id,
      accountId: demoAccounts[0].id,
      amount: 2500,
      daysAgo: 2,
      comment: "Пополнение транспортной карты",
    },
    {
      type: "expense",
      categoryId: demoCategories[3].id,
      accountId: demoAccounts[1].id,
      amount: 450,
      daysAgo: 4,
      comment: "Такси",
    },
    {
      type: "expense",
      categoryId: demoCategories[3].id,
      accountId: demoAccounts[0].id,
      amount: 2500,
      daysAgo: 32,
      comment: "Пополнение транспортной карты",
    },

    // Расходы - развлечения
    {
      type: "expense",
      categoryId: demoCategories[4].id,
      accountId: demoAccounts[0].id,
      amount: 1200,
      daysAgo: 7,
      comment: "Кино",
    },
    {
      type: "expense",
      categoryId: demoCategories[4].id,
      accountId: demoAccounts[0].id,
      amount: 3500,
      daysAgo: 14,
      comment: "Концерт",
    },

    // Расходы - кафе
    {
      type: "expense",
      categoryId: demoCategories[5].id,
      accountId: demoAccounts[0].id,
      amount: 850,
      daysAgo: 2,
      comment: "Обед",
    },
    {
      type: "expense",
      categoryId: demoCategories[5].id,
      accountId: demoAccounts[1].id,
      amount: 320,
      daysAgo: 4,
      comment: "Кофе",
    },
    {
      type: "expense",
      categoryId: demoCategories[5].id,
      accountId: demoAccounts[0].id,
      amount: 2100,
      daysAgo: 6,
      comment: "Ресторан",
    },
    {
      type: "expense",
      categoryId: demoCategories[5].id,
      accountId: demoAccounts[0].id,
      amount: 780,
      daysAgo: 9,
      comment: "",
    },

    // Расходы - здоровье
    {
      type: "expense",
      categoryId: demoCategories[6].id,
      accountId: demoAccounts[0].id,
      amount: 1500,
      daysAgo: 11,
      comment: "Аптека",
    },

    // Расходы - коммунальные
    {
      type: "expense",
      categoryId: demoCategories[7].id,
      accountId: demoAccounts[0].id,
      amount: 8500,
      daysAgo: 25,
      comment: "Квартплата",
    },
  ].map((op, idx) => {
    const date = new Date(now);
    date.setDate(date.getDate() - op.daysAgo);

    return {
      id: `demo_op_${idx}`,
      userId: demoUser.id,
      type: op.type,
      categoryId: op.categoryId,
      accountId: op.accountId,
      amount: op.amount,
      date: date.toISOString(),
      comment: op.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  operations.push(...demoOperations);
  localStorage.setItem(STORAGE_KEYS.OPERATIONS, JSON.stringify(operations));

  console.log("✅ Демо-пользователь создан:", demoUser.email);
  console.log("📊 Создано категорий:", demoCategories.length);
  console.log("💳 Создано счетов:", demoAccounts.length);
  console.log("💸 Создано операций:", demoOperations.length);
}

// Вызываем при загрузке модуля
if (typeof window !== "undefined") {
  setupDemoUser();
}
