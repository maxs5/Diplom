const express = require("express");
const { updateMe, removeMe } = require("../controllers/usersController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/me", authMiddleware, updateMe);
router.delete("/me", authMiddleware, removeMe);

module.exports = router;
