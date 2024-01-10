const express = require('express');
const { createTest , getAllTests, getSingleTest, updateTest, deleteTest } = require ('../controllers/testController');
const router = express.Router();

const authenticateJWT = require('../middlewares/auth');

router.get('/all/:sortByName?', authenticateJWT, getAllTests);
router.post('/', authenticateJWT, createTest);
router.get('/:id', authenticateJWT, getSingleTest);
router.put('/:id', authenticateJWT, updateTest);
router.delete('/:id', authenticateJWT, deleteTest);

module.exports = router;
