const express = require('express');
const { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } = require ('../controllers/expenseController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.get('/:groupId', authenticateJWT, getExpenses);
router.get('/:groupId/:expenseId', authenticateJWT, getExpense);
router.post('/', authenticateJWT, createExpense);
router.put('/:id', authenticateJWT, updateExpense);
router.delete('/:id', authenticateJWT, deleteExpense);

module.exports = router;
