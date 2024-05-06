const express = require('express');
const { getRefunds } = require ('../controllers/refundController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.get('/:groupId', authenticateJWT, getRefunds)

module.exports = router;
