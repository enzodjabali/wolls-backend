const express = require('express');
const { createGroup, getAllGroups } = require ('../controllers/groupController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/', authenticateJWT, createGroup);
router.get('/', authenticateJWT, getAllGroups);


module.exports = router;
