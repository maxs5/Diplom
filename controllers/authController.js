const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { createToken } = require("../utils/token");
const User = require("../models/User");
const { users } = require("../data/inMemoryStore");

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function mapMemoryUser(user) {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    currency: user.currency || "RUB",
  };
}

function mapUser(user) {
  if (!user) return null;

  if (!user._id) {
    return mapMemoryUser(user);
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    currency: user.currency || "RUB",
  };
}

async function register(req, res) {
  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ success: false, error: "email, password и name обязательны" });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = String(name).trim();
    const passwordHash = bcrypt.hashSync(password, 10);

    let createdUser;
    if (isMongoReady()) {
      const exists = await User.findOne({ email: normalizedEmail }).lean();
      if (exists) {
        return res
          .status(409)
          .json({ success: false, error: "Пользователь уже существует" });
      }

      createdUser = await User.create({
        email: normalizedEmail,
        password: passwordHash,
        name: normalizedName,
        currency: "RUB",
      });
    } else {
      const exists = users.find((user) => user.email === normalizedEmail);
      if (exists) {
        return res
          .status(409)
          .json({ success: false, error: "Пользователь уже существует" });
      }

      createdUser = {
        id: `u_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        email: normalizedEmail,
        passwordHash,
        name: normalizedName,
        currency: "RUB",
      };
      users.push(createdUser);
    }

    const token = createToken(createdUser);

    return res.status(201).json({
      success: true,
      token,
      user: mapUser(createdUser),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Ошибка регистрации" });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "email и password обязательны" });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    let user = null;
    let passwordHash = null;

    if (isMongoReady()) {
      user = await User.findOne({ email: normalizedEmail });
      passwordHash = user?.password;
    } else {
      user = users.find((item) => item.email === normalizedEmail) || null;
      passwordHash = user?.passwordHash;
    }

    if (!user || !passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      return res
        .status(401)
        .json({ success: false, error: "Неверный email или пароль" });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      token,
      user: mapUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Ошибка входа" });
  }
}

async function me(req, res) {
  try {
    let user = null;

    if (isMongoReady()) {
      user = await User.findById(req.auth.userId);
    } else {
      user =
        users.find((item) => String(item.id) === String(req.auth.userId)) ||
        null;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Пользователь не найден" });
    }

    return res.json({
      success: true,
      user: mapUser(user),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Ошибка получения профиля" });
  }
}

module.exports = {
  register,
  login,
  me,
};
