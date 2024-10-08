const express = require('express');
const { createGroup, getGroupsList, getGroupById, updateGroupById, deleteGroupById, getGroupsWhereCurrentUserIsOnlyAdmin } = require ('../controllers/groupController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroup);
router.get('/', authenticateJWT, getGroupsList);
router.get('/onlyAdmin', authenticateJWT, getGroupsWhereCurrentUserIsOnlyAdmin);
router.get('/:id', authenticateJWT, getGroupById);
router.patch('/:id', authenticateJWT, updateGroupById);
router.delete('/:id', authenticateJWT, deleteGroupById);

module.exports = router;
