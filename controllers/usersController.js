const User = require("../models/User");
const Operation = require("../models/Operation");
const RecurringOperation = require("../models/RecurringOperation");
const Account = require("../models/Account");
const Category = require("../models/Category");
const Budget = require("../models/Budget");
const mongoose = require("mongoose");
const { users } = require("../data/inMemoryStore");

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function mapUser(user) {
  if (!user) return null;

  if (!user._id) {
    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      currency: user.currency || "RUB",
    };
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    currency: user.currency || "RUB",
  };
}

async function updateMe(req, res) {
  const id = req.auth.userId;
  const { name, email } = req.body || {};

  if (!name && !email) {
    return res
      .status(400)
      .json({
        success: false,
        error: "Передайте name или email для обновления",
      });
  }

  try {
    if (!isMongoReady()) {
      const user = users.find((item) => String(item.id) === String(id));
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "Пользователь не найден" });
      }

      if (email) {
        const normalizedEmail = String(email).trim().toLowerCase();
        const emailTaken = users.some(
          (item) =>
            String(item.id) !== String(id) && item.email === normalizedEmail,
        );

        if (emailTaken) {
          return res
            .status(409)
            .json({ success: false, error: "Email уже используется" });
        }

        user.email = normalizedEmail;
      }

      if (name) {
        user.name = String(name).trim();
      }

      return res.json({
        success: true,
        user: mapUser(user),
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
      .status(404)
        .json({ success: false, error: "Пользователь не найден" });
    }

    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailTaken = await User.exists({
        email: normalizedEmail,
        _id: { $ne: id },
      });
      if (emailTaken) {
        return res
          .status(409)
          .json({ success: false, error: "Email уже используется" });
      }
      user.email = normalizedEmail;
    }

    if (name) {
      user.name = String(name).trim();
    }

    await user.save();

    return res.json({
      success: true,
      user: mapUser(user),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Ошибка обновления профиля" });
  }
}

async function removeMe(req, res) {
  const id = req.auth.userId;

  try {
    if (!isMongoReady()) {
      const index = users.findIndex((item) => String(item.id) === String(id));
      if (index < 0) {
        return res
          .status(404)
          .json({ success: false, error: "Пользователь не найден" });
      }

      const [deletedUser] = users.splice(index, 1);
      return res.json({
        success: true,
        user: {
          id: String(deletedUser.id),
          email: deletedUser.email,
          name: deletedUser.name,
        },
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, error: "Пользователь не найден" });
    }

    await Promise.all([
      Operation.deleteMany({ userId: id }),
      RecurringOperation.deleteMany({ userId: id }),
      Account.deleteMany({ userId: id }),
      Category.deleteMany({ userId: id }),
      Budget.deleteMany({ userId: id }),
    ]);

    return res.json({
      success: true,
      user: {
        id: deletedUser._id.toString(),
        email: deletedUser.email,
        name: deletedUser.name,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Ошибка удаления пользователя" });
  }
}

module.exports = {
  updateMe,
  removeMe,
};
