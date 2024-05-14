const Expense = require('../models/Expense');
const { getRefundRecipients } = require('../middlewares/refundUtils');
const GroupMembership = require("../models/GroupMembership");

// Function to calculate refunds based on expenses
const calculateRefunds = (expenses) => {
    const refunds = [];

    // Iterate over expenses to calculate refunds
    expenses.forEach((expense) => {
        // Get refund recipients for the expense
        const refundRecipients = getRefundRecipients(expense);

        // Add refund details to the refunds array
        refunds.push({
            expense_id: expense._id,
            group_id: expense.group_id,
            creator_id: expense.creator_id,
            refund_recipients: refundRecipients
        });
    });

    return refunds;
};

// Function to get refunds for a specific group
const getRefunds = async (req, res) => {
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

        // Calculate refunds based on expenses
        const refunds = calculateRefunds(expenses);

        res.status(200).json(refunds); // Respond with the calculated refunds
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRefunds };
