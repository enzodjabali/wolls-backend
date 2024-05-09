const express = require('express');
const multer = require('multer');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const router = express.Router();
const authenticateJWT = require('../middlewares/auth');

// Configurer multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Assurez-vous que ce dossier existe
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.get('/:groupId', authenticateJWT, getExpenses);
router.post('/', authenticateJWT, upload.single('receipt'), createExpense); // Ajout de upload.single('receipt')
router.put('/:id', authenticateJWT, updateExpense);
router.delete('/:id', authenticateJWT, deleteExpense);

module.exports = router;
