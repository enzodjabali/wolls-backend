const express = require('express');
const { registerUser, loginUser, whoami, getAllUsers, deleteUser, updateMyself } = require ('../controllers/userController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.get('/all', authenticateJWT, getAllUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateJWT, whoami);
router.put('/', authenticateJWT, updateMyself);
router.delete('/', authenticateJWT, deleteUser);

module.exports = router;
