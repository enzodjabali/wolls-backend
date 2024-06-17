const express = require('express');
const { createGroupMembership, getGroupMembers, deleteGroupMembership, getInvitations, manageInvitation, getInvitationCount, getAllUsersWithGroupMembershipStatus, updateGroupMembership } = require('../controllers/groupMembershipController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroupMembership);
router.get('/:id/members', authenticateJWT, getGroupMembers);
router.get('/:id/members/status', authenticateJWT, getAllUsersWithGroupMembershipStatus);
router.put('/:groupId/:userId', authenticateJWT, updateGroupMembership);
router.delete('/:groupId/:userId', authenticateJWT, deleteGroupMembership);
router.get('/invitations', authenticateJWT, getInvitations);
router.post('/invitations', authenticateJWT, manageInvitation);
router.get('/invitations/count', authenticateJWT, getInvitationCount);

module.exports = router;
