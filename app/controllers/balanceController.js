const Expense = require('../models/Expense');
const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User'); // Make sure to require the User model
const LOCALE = require('../locales/en-GB');
const mongoose = require('mongoose');

/**
 * Calculates the balances for each user in a group based on their expenses and refunds
 * @param {Object} req The request object containing parameters
 * @param {Object} res The response object to send back the balances
 * @returns {Object} Returns an object containing user pseudonyms as keys and their corresponding balances
 */
const getBalances = async (req, res) => {
    const groupId = req.params.groupId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const expenses = await Expense.find({ group_id: groupId, isRefunded: false }).populate('refund_recipients');

        const groupMemberships = await GroupMembership.find({ group_id: groupId }).populate('user_id', 'pseudonym');

        const balances = {};
        groupMemberships.forEach(membership => {
            const userId = membership.user_id._id.toString();
            const pseudonym = membership.user_id.pseudonym;
            balances[userId] = { pseudonym, balance: 0 };
        });

        for (const expense of expenses) {
            const buyerId = expense.creator_id.toString();
            const buyer = await User.findById(buyerId, 'pseudonym');
            const receivers = expense.refund_recipients.map(recipient => recipient._id.toString());
            const splitAmount = expense.amount / receivers.length;

            if (!balances[buyerId]) {
                balances[buyerId] = { pseudonym: buyer.pseudonym, balance: 0 };
            }
            balances[buyerId].balance += expense.amount;

            for (const receiverId of receivers) {
                if (!balances[receiverId]) {
                    const recipient = await User.findById(receiverId, 'pseudonym');
                    balances[receiverId] = { pseudonym: recipient.pseudonym, balance: 0 };
                }
                balances[receiverId].balance -= splitAmount;
            }
        }

        const filteredBalances = {};
        for (const { pseudonym, balance } of Object.values(balances)) {
            if (balance !== 0) {
                filteredBalances[pseudonym] = balance;
            }
        }

        res.status(200).json({ balances: filteredBalances });
    } catch (error) {
        console.error('Error fetching the balances:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { getBalances };
