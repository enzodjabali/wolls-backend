const Expense = require('../models/Expense');
const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');

async function getBalances(groupId) {
    try {
        // Find all expenses associated with the specified group
        const expenses = await Expense.find({ group_id: groupId }).populate('refund_recipients');

        // Find all members of the group
        const groupMemberships = await GroupMembership.find({ group_id: groupId }).populate('user_id');

        const balances = {};

        // Initialize balances for each user
        groupMemberships.forEach(membership => {
            const userId = membership.user_id._id;
            balances[userId] = 0;
        });

        // Calculate balance for each user
        expenses.forEach(expense => {
            const buyer = expense.creator_id;
            const receivers = expense.refund_recipients;

            // Deduct expense amount from buyer's balance
            balances[buyer] -= expense.amount;

            // Split the expense amount equally among receivers
            const splitAmount = expense.amount / receivers.length;

            // Add split amount to each receiver's balance
            receivers.forEach(receiver => {
                balances[receiver._id] += splitAmount;
            });
        });

        return balances;
    } catch (error) {
        throw new Error("Error calculating balance: " + error.message);
    }
}

module.exports = { getBalances };