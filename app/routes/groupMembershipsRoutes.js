const express = require('express');
const { createGroupMembership, getGroupMembers, deleteGroupMembership, getInvitations, manageInvitation } = require('../controllers/groupMembershipController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroupMembership);
router.get('/:id/members', authenticateJWT, getGroupMembers);
router.delete('/:groupId/:userId', authenticateJWT, deleteGroupMembership);
router.get('/invitations', authenticateJWT, getInvitations);
router.post('/invitations', authenticateJWT, manageInvitation);

module.exports = router;
