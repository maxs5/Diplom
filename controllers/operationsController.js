const { operations } = require('../data/inMemoryStore');

function createOperation(req, res) {
  const { userId, type, amount, categoryId, accountId, comment = '' } = req.body || {};

  if (
    !userId ||
    !type ||
    amount === '' ||
    amount === null ||
    amount === undefined ||
    !categoryId ||
    !accountId
  ) {
    return res.status(400).json({
      success: false,
      error: 'userId, type, amount, categoryId и accountId обязательны',
    });
  }

  const amountValue = Number(amount);
  if (Number.isNaN(amountValue) || amountValue <= 0) {
    return res.status(400).json({
      success: false,
      error: 'amount должен быть числом больше 0',
    });
  }

  const newOperation = {
    id: Date.now().toString(),
    userId,
    type,
    amount: amountValue,
    categoryId,
    accountId,
    comment,
    createdAt: new Date().toISOString(),
  };

  operations.push(newOperation);
  return res.status(201).json({ success: true, operation: newOperation });
}

function updateOperation(req, res) {
  const { id } = req.params;
  const { type, amount, categoryId, accountId, comment } = req.body || {};

  const operationIndex = operations.findIndex((item) => item.id === id);
  if (operationIndex === -1) {
    return res.status(404).json({ success: false, error: 'Операция не найдена' });
  }

  if (!type && amount === undefined && !categoryId && !accountId && comment === undefined) {
    return res.status(400).json({ success: false, error: 'Нет данных для обновления' });
  }

  if (amount !== undefined) {
    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ success: false, error: 'amount должен быть числом больше 0' });
    }
  }

  operations[operationIndex] = {
    ...operations[operationIndex],
    ...(type ? { type } : {}),
    ...(amount !== undefined ? { amount: Number(amount) } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(accountId ? { accountId } : {}),
    ...(comment !== undefined ? { comment } : {}),
    updatedAt: new Date().toISOString(),
  };

  return res.json({ success: true, operation: operations[operationIndex] });
}

function removeOperation(req, res) {
  const { id } = req.params;
  const operationIndex = operations.findIndex((item) => item.id === id);

  if (operationIndex === -1) {
    return res.status(404).json({ success: false, error: 'Операция не найдена' });
  }

  const [deletedOperation] = operations.splice(operationIndex, 1);
  return res.json({ success: true, operation: deletedOperation });
}

module.exports = {
  createOperation,
  updateOperation,
  removeOperation,
};
