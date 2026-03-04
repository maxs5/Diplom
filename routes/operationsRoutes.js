const express = require("express");
const {
  createOperation,
  updateOperation,
  removeOperation,
} = require("../controllers/operationsController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createOperation);
router.put("/:id", authMiddleware, updateOperation);
router.delete("/:id", authMiddleware, removeOperation);

module.exports = router;
