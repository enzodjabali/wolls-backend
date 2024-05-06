const Expense = require('../models/Expense');
const GroupMembership = require('../models/GroupMembership');
const { createExpenseSchema, updateExpenseSchema } = require('../middlewares/validationSchema');

// Function to get all expenses for a specific group
const getExpenses = async (req, res) => {
    const groupId = req.params.groupId; // Extract group ID from request parameters

    try {
        // Check if the current user has accepted the group invitation
        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ message: "You do not have permission to view expenses for this group" });
        }

        // Find all expenses associated with the specified group
        const expenses = await Expense.find({ group_id: groupId });

        res.status(200).json(expenses); // Respond with the expenses
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create expense
const createExpense = async (req, res) => {
    try {
        // Validate request body
        await createExpenseSchema.validateAsync(req.body);

        // Extract data from request body
        const { title, amount, category, group_id, refund_recipients } = req.body;
        const creator_id = req.userId;
        const date = Date.now(); // Set current date

        // Create new expense instance
        const newExpense = new Expense({
            title,
            amount,
            date,
            creator_id,
            group_id,
            category,
            refund_recipients
        });

        // Save the new expense to the database
        const savedExpense = await newExpense.save();

        // Respond with the saved expense
        res.status(201).json(savedExpense);
    } catch (error) {
        // Handle validation errors
        if (error.isJoi) {
            res.status(400).json({ message: error.details[0].message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Edit expense
const updateExpense = async (req, res) => {
    const expenseId = req.params.id; // Extract expense ID from request parameters

    try {
        // Validate request body
        await updateExpenseSchema.validateAsync(req.body);

        // Find expense by ID
        let expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Check if the current user is the creator of the expense
        if (expense.creator_id != req.userId) {
            return res.status(403).json({ message: "You do not have permission to edit this expense" });
        }

        // Update expense data
        const { title, amount, category } = req.body;
        expense.title = title;
        expense.amount = amount;
        expense.category = category;

        // Save updated expense to the database
        const updatedExpense = await expense.save();

        // Respond with the updated expense
        res.status(200).json(updatedExpense);
    } catch (error) {
        // Handle validation errors
        if (error.isJoi) {
            res.status(400).json({ message: error.details[0].message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    const expenseId = req.params.id; // Extract expense ID from request parameters

    try {
        // Find expense by ID
        let expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Check if the current user is the creator of the expense
        if (expense.creator_id != req.userId) {
            return res.status(403).json({ message: "You do not have permission to delete this expense" });
        }

        // Delete expense
        await Expense.findByIdAndDelete(expenseId);

        // Respond with success message
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
