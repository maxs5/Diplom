const bcrypt = require("bcryptjs");
const { createToken } = require("../utils/token");
const User = require("../models/User");

function mapUser(user) {
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
    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      return res
        .status(409)
        .json({ success: false, error: "Пользователь уже существует" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      email: normalizedEmail,
      password: passwordHash,
      name: String(name).trim(),
      currency: "RUB",
    });

    const token = createToken(newUser);

    return res.status(201).json({
      success: true,
      token,
      user: mapUser(newUser),
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
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !bcrypt.compareSync(password, user.password)) {
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
    const user = await User.findById(req.auth.userId);

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
