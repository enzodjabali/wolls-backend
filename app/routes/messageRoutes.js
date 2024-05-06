const express = require('express');
const { sendPrivateMessage, sendGroupMessage } = require ('../controllers/messageController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/private', authenticateJWT, sendPrivateMessage);
router.post('/group', authenticateJWT, sendGroupMessage);

module.exports = router;
