const express = require('express');
const {
  createOperation,
  updateOperation,
  removeOperation,
} = require('../controllers/operationsController');

const router = express.Router();

router.post('/', createOperation);
router.put('/:id', updateOperation);
router.delete('/:id', removeOperation);

module.exports = router;
