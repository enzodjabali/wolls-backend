const express = require('express');
const { sendGroupMessage, getGroupMessages, getGroupMessageCount } = require('../controllers/messageController');
const router = express.Router();
const authenticateJWT = require('../middlewares/auth');

router.post('/group', authenticateJWT, sendGroupMessage);
router.get('/group/:groupId', authenticateJWT, getGroupMessages);
router.get('/group/:groupId/count', authenticateJWT, getGroupMessageCount);

module.exports = router;
