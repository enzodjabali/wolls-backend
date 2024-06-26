const express = require('express');
const { sendGroupMessage, getGroupMessages } = require('../controllers/messageController');
const router = express.Router();
const authenticateJWT = require('../middlewares/auth');

router.post('/group', authenticateJWT, sendGroupMessage);
router.get('/group/:groupId', authenticateJWT, getGroupMessages);

module.exports = router;
