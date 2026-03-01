const bcrypt = require('bcryptjs');

const users = [
  {
    id: '1',
    email: 'demo@test.com',
    passwordHash: bcrypt.hashSync('123456', 10),
    name: 'Demo User',
    currency: 'RUB',
  },
];

const operations = [];

module.exports = {
  users,
  operations,
};
