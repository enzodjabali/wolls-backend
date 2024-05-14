const Expense = require('../models/Expense');
const { getRefundRecipients } = require('../middlewares/refundUtils');
const GroupMembership = require("../models/GroupMembership");

// Function to calculate balances based on expenses
const calculateBalances = (expenses) => {
    const balances = {};

    // Iterate over expenses to update balances
    expenses.forEach((expense) => {
        // Get refund recipients for the expense
        const refundRecipients = getRefundRecipients(expense);

        // Update balances for each user involved in the expense
        const totalExpense = expense.amount / refundRecipients.length;
        refundRecipients.forEach(recipient => {
            balances[recipient] = (balances[recipient] || 0) + totalExpense;
        });
        balances[expense.creator_id] = (balances[expense.creator_id] || 0) - expense.amount;
    });

    return balances;
};

// Function to get balances for a specific group
const getBalances = async (req, res) => {
    const groupId = req.params.groupId; // Extract group ID from request parameters
    const userId = req.userId; // Extract user ID from request

    try {
        // Check if the current user is a member of the group
        const isMember = await GroupMembership.exists({ user_id: userId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Retrieve expenses for the group
        const expenses = await Expense.find({ group_id: groupId });

        // Calculate balances based on expenses
        const balances = calculateBalances(expenses);

        res.status(200).json(balances); // Respond with the calculated balances
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBalances };
