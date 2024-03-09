const express = require('express');
const { createGroup, getAllGroups, getGroupById } = require ('../controllers/groupController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroup);
router.get('/', authenticateJWT, getAllGroups);
router.get('/:id', authenticateJWT, getGroupById);

module.exports = router;
