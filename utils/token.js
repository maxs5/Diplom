const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

function createToken(user) {
  const userId = user.id || (user._id ? user._id.toString() : undefined);
  return jwt.sign({ userId, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

module.exports = { createToken };
