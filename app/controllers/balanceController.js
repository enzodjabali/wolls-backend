const Expense = require('../models/Expense');
const GroupMembership = require('../models/GroupMembership');
const LOCALE = require('../locales/en-GB');

const mongoose = require("mongoose");

/**
 * Calculates the balances for each user in a group based on their expenses and refunds
 * @param {Object} req The request object containing parameters
 * @param {Object} res The response object to send back the balances
 * @returns {Object} Returns an object containing user IDs as keys and their corresponding balances
 */
const getBalances = async (req, res) => {
    const groupId = req.params.groupId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const expenses = await Expense.find({ group_id: groupId, isRefunded: false }).populate('refund_recipients');

        const groupMemberships = await GroupMembership.find({ group_id: groupId }).populate('user_id');

        const balances = {};
        groupMemberships.forEach(membership => {
            const userId = membership.user_id._id.toString();
            balances[userId] = 0;
        });

        expenses.forEach(expense => {
            const buyerId = expense.creator_id.toString();
            const receivers = expense.refund_recipients.map(recipient => recipient._id.toString());
            const splitAmount = expense.amount / receivers.length;

            if (!balances[buyerId]) balances[buyerId] = 0;
            balances[buyerId] += expense.amount;

            receivers.forEach(receiverId => {
                if (!balances[receiverId]) balances[receiverId] = 0;
                balances[receiverId] -= splitAmount;
            });
        });

        res.status(200).json({ balances });
    } catch (error) {
        console.error('Error fetching the balances:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { getBalances };