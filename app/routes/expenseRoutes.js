const express = require('express');
const { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, deleteExpenseAttachment, getGroupExpensesAmounts } = require ('../controllers/expenseController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.get('/:groupId/amount', authenticateJWT, getGroupExpensesAmounts);
router.get('/:groupId', authenticateJWT, getExpenses);
router.get('/:groupId/:expenseId', authenticateJWT, getExpense);
router.post('/', authenticateJWT, createExpense);
router.patch('/:id', authenticateJWT, updateExpense);
router.delete('/:id', authenticateJWT, deleteExpense);
router.delete('/:id/attachment', authenticateJWT, deleteExpenseAttachment);

module.exports = router;
