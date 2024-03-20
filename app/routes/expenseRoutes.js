const express = require('express');
const { getExpenses ,createExpense, updateExpense, deleteExpense } = require ('../controllers/expenseController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.get('/:groupId', authenticateJWT, getExpenses)
router.post('/', authenticateJWT, createExpense);
router.put('/:id', authenticateJWT, updateExpense);
router.delete('/:id', authenticateJWT, deleteExpense);

module.exports = router;
