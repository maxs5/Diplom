const { users, operations } = require('../data/inMemoryStore');

function updateMe(req, res) {
  const id = req.auth.userId;
  const { name, email } = req.body || {};

  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'Пользователь не найден' });
  }

  if (!name && !email) {
    return res.status(400).json({ success: false, error: 'Передайте name или email для обновления' });
  }

  if (email) {
    const emailTaken = users.some((user) => user.email === email && user.id !== id);
    if (emailTaken) {
      return res.status(409).json({ success: false, error: 'Email уже используется' });
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
  };

  return res.json({
    success: true,
    user: {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      currency: users[userIndex].currency || 'RUB',
    },
  });
}

function removeUser(req, res) {
  const { id } = req.params;
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'Пользователь не найден' });
  }

  const [deletedUser] = users.splice(userIndex, 1);

  for (let i = operations.length - 1; i >= 0; i -= 1) {
    if (operations[i].userId === id) {
      operations.splice(i, 1);
    }
  }

  return res.json({
    success: true,
    user: {
      id: deletedUser.id,
      email: deletedUser.email,
      name: deletedUser.name,
    },
  });
}

module.exports = {
  updateMe,
  removeUser,
};
