const express = require('express');
const { getBalances } = require ('../controllers/balanceController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.get('/:groupId', authenticateJWT, getBalances)

module.exports = router;
