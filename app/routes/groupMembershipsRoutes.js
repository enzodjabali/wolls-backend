const express = require('express');
const { createGroupMembership, getGroupMembers } = require('../controllers/groupMembershipController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroupMembership);
router.get('/:id/members', authenticateJWT, getGroupMembers);

module.exports = router;
