const express = require('express');
const { createGroupMembership, getGroupMembers, deleteGroupMembership } = require('../controllers/groupMembershipController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroupMembership);
router.get('/:id/members', authenticateJWT, getGroupMembers);
router.delete('/:groupId/:userId', authenticateJWT, deleteGroupMembership);

module.exports = router;
