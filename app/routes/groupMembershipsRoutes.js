const express = require('express');
const { createGroupMembership } = require ('../controllers/groupMembershipController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroupMembership);

module.exports = router;
