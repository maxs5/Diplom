const express = require('express');
const { updateMe, removeUser } = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/me', authMiddleware, updateMe);
router.delete('/:id', removeUser);

module.exports = router;
