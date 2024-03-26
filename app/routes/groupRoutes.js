const express = require('express');
const { createGroup, getAllGroups, getGroupById, deleteGroupById } = require ('../controllers/groupController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroup);
router.get('/', authenticateJWT, getAllGroups);
router.get('/:id', authenticateJWT, getGroupById);
router.delete('/:id', authenticateJWT, deleteGroupById);

module.exports = router;
