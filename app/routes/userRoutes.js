const express = require('express');
const { registerUser, authenticateUser, getUsersList, getCurrentUser, updateCurrentUser, updatePasswordCurrentUser, logoutUser, deleteCurrentUser, getUserById, googleLogin } = require ('../controllers/userController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', authenticateUser);
router.post('/login-google', googleLogin);
router.get('/', authenticateJWT, getUsersList);
router.get('/me', authenticateJWT, getCurrentUser);
router.put('/', authenticateJWT, updateCurrentUser);
router.put('/password', authenticateJWT, updatePasswordCurrentUser);
router.post('/logout', authenticateJWT, logoutUser);
router.delete('/', authenticateJWT, deleteCurrentUser);
router.get('/:id', authenticateJWT, getUserById);

module.exports = router;
