const bcrypt = require('bcryptjs');
const { users } = require('../data/inMemoryStore');
const { createToken } = require('../utils/token');

function register(req, res) {
  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'email, password и name обязательны' });
  }

  const exists = users.find((user) => user.email === email);
  if (exists) {
    return res.status(409).json({ success: false, error: 'Пользователь уже существует' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now().toString(),
    email,
    passwordHash,
    name,
    currency: 'RUB',
  };

  users.push(newUser);
  const token = createToken(newUser);

  return res.status(201).json({
    success: true,
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, currency: newUser.currency },
  });
}

function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'email и password обязательны' });
  }

  const user = users.find((item) => item.email === email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
  }

  const token = createToken(user);

  return res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, currency: user.currency || 'RUB' },
  });
}

function me(req, res) {
  const user = users.find((item) => item.id === req.auth.userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'Пользователь не найден' });
  }

  return res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, currency: user.currency || 'RUB' },
  });
}

module.exports = {
  register,
  login,
  me,
};
