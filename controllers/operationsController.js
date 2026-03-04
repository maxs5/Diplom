const mongoose = require("mongoose");
const Operation = require("../models/Operation");

function mapOperation(operation) {
  return {
    id: operation._id.toString(),
    userId: operation.userId.toString(),
    type: operation.type,
    amount: operation.amount,
    categoryId: operation.categoryId.toString(),
    accountId: operation.accountId.toString(),
    comment: operation.comment || "",
    date: operation.date,
    createdAt: operation.createdAt,
    updatedAt: operation.updatedAt,
  };
}

async function createOperation(req, res) {
  const {
    type,
    amount,
    categoryId,
    accountId,
    comment = "",
    date,
  } = req.body || {};
  const userId = req.auth.userId;

  if (
    !userId ||
    !type ||
    amount === "" ||
    amount === null ||
    amount === undefined ||
    !categoryId ||
    !accountId
  ) {
    return res.status(400).json({
      success: false,
      error: "userId, type, amount, categoryId и accountId обязательны",
    });
  }

  const amountValue = Number(amount);
  if (Number.isNaN(amountValue) || amountValue <= 0) {
    return res.status(400).json({
      success: false,
      error: "amount должен быть числом больше 0",
    });
  }

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(accountId) ||
    !mongoose.Types.ObjectId.isValid(categoryId)
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Некорректные идентификаторы" });
  }

  try {
    const operation = await Operation.create({
      userId,
      type,
      amount: amountValue,
      categoryId,
      accountId,
      comment,
      ...(date ? { date } : {}),
    });

    return res
      .status(201)
      .json({ success: true, operation: mapOperation(operation) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Ошибка создания операции" });
  }
}

async function updateOperation(req, res) {
  const { id } = req.params;
  const { type, amount, categoryId, accountId, comment } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, error: "Некорректный id операции" });
  }

  if (
    !type &&
    amount === undefined &&
    !categoryId &&
    !accountId &&
    comment === undefined
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Нет данных для обновления" });
  }

  if (amount !== undefined) {
    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "amount должен быть числом больше 0" });
    }
  }

  if (
    (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) ||
    (accountId && !mongoose.Types.ObjectId.isValid(accountId))
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Некорректные идентификаторы" });
  }

  const updates = {
    ...(type ? { type } : {}),
    ...(amount !== undefined ? { amount: Number(amount) } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(accountId ? { accountId } : {}),
    ...(comment !== undefined ? { comment } : {}),
  };

  try {
    const operation = await Operation.findOneAndUpdate(
      { _id: id, userId: req.auth.userId },
      updates,
      { new: true },
    );

    if (!operation) {
      return res
        .status(404)
        .json({ success: false, error: "Операция не найдена" });
    }

    return res.json({ success: true, operation: mapOperation(operation) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Ошибка обновления операции" });
  }
}

async function removeOperation(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, error: "Некорректный id операции" });
  }

  try {
    const deletedOperation = await Operation.findOneAndDelete({
      _id: id,
      userId: req.auth.userId,
    });
    if (!deletedOperation) {
      return res
        .status(404)
        .json({ success: false, error: "Операция не найдена" });
    }

    return res.json({
      success: true,
      operation: mapOperation(deletedOperation),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Ошибка удаления операции" });
  }
}

module.exports = {
  createOperation,
  updateOperation,
  removeOperation,
};
