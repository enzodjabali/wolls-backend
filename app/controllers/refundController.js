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

// Function to calculate refunds based on expenses
const calculateRefundsSimplified = (expenses) => {
    const refunds = {};

    // Iterate over expenses to calculate refunds
    expenses.forEach((expense) => {
        const { creator_id, refund_recipients, amount } = expense;
        const numRecipients = refund_recipients.length;

        // Calculate amount to be refunded to each recipient
        const refundAmountPerRecipient = amount / numRecipients;

        refund_recipients.forEach(recipient => {
            // Initialize the refund amount owed to the recipient by the creator
            if (!refunds[creator_id]) {
                refunds[creator_id] = {};
            }
            if (!refunds[creator_id][recipient]) {
                refunds[creator_id][recipient] = 0;
            }

            // Add the refund amount to the total owed to the recipient
            refunds[creator_id][recipient] += refundAmountPerRecipient;
        });
    });

    // Construct the refunds array from the refunds object
    const refundsArray = [];
    Object.keys(refunds).forEach(creator_id => {
        Object.keys(refunds[creator_id]).forEach(recipient => {
            refundsArray.push({
                creator_id,
                recipient_id: recipient,
                refund_amount: refunds[creator_id][recipient]
            });
        });
    });

    return refundsArray;
};

// Function to get refunds for a specific group
const getRefunds = async (req, res) => {
    const groupId = req.params.groupId; // Extract group ID from request parameters
    const userId = req.userId; // Extract user ID from request
    const simplified = req.query.simplified === 'true'; // Extract simplified query parameter

    try {
        // Check if the current user is a member of the group
        const isMember = await GroupMembership.exists({ user_id: userId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Retrieve expenses for the group
        const expenses = await Expense.find({ group_id: groupId });

        let refunds = [];

        // Calculate refunds based on expenses
        if (simplified) {
            refunds = calculateRefundsSimplified(expenses);
        } else {
            refunds = calculateRefunds(expenses);
        }

        res.status(200).json(refunds); // Respond with the calculated refunds
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRefunds };
