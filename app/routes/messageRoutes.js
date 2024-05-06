const express = require('express');
const { sendPrivateMessage, sendGroupMessage, getPrivateMessages, getGroupMessages } = require ('../controllers/messageController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/private', authenticateJWT, sendPrivateMessage);
router.post('/group', authenticateJWT, sendGroupMessage);
router.get('/private/:userId', authenticateJWT, getPrivateMessages);
router.get('/group/:groupId', authenticateJWT, getGroupMessages);

module.exports = router;
