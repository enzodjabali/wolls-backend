const Expense = require('../models/Expense');
const { getRefundRecipients } = require('../middlewares/refundUtils');
const GroupMembership = require("../models/GroupMembership");

const calculateBalances = (expenses) => {
    const balances = {};

    expenses.forEach((expense) => {
        const refundRecipients = getRefundRecipients(expense);
        const totalExpense = expense.amount;

        // Subtract the total expense from the buyer's balance
        balances[expense.creator_id] = (balances[expense.creator_id] || 0) - totalExpense;

        // Calculate and distribute the expense among recipients
        refundRecipients.forEach(recipient => {
            balances[recipient] = (balances[recipient] || 0) + (totalExpense / refundRecipients.length);
        });
    });

    return balances;
};

const getBalances = async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.userId;

    try {
        const isMember = await GroupMembership.exists({ user_id: userId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const expenses = await Expense.find({ group_id: groupId });

        const balances = calculateBalances(expenses);

        res.status(200).json(balances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBalances };
