const Expense = require('../models/Expense');
const GroupMembership = require("../models/GroupMembership");
const User = require('../models/User');
const LOCALE = require('../locales/en-GB');
const mongoose = require("mongoose");

/**
 * Calculates refund recipients and their corresponding refund amounts for a given expense
 * @param {Object} expense The expense object containing amount and refund recipients
 * @returns {Array} Returns an array of refund objects containing recipient ID and refund amount
 */
const getRefundRecipients = async (expense) => {
    const { amount, refund_recipients } = expense;
    const numRecipients = refund_recipients.length;

    if (numRecipients === 0) {
        return [];
    }

    const refundAmountPerRecipient = amount / numRecipients;

    const recipients = await User.find({ _id: { $in: refund_recipients } }).select('pseudonym');

    return recipients.map(recipient => ({
        recipient_pseudonym: recipient.pseudonym,
        refund_amount: refundAmountPerRecipient
    }));
};

/**
 * Calculates refunds based on expenses
 * @param {Array} expenses The array of expenses for which refunds need to be calculated
 * @returns {Array} Returns an array of refund details containing expense ID, group ID, creator pseudonym, and refund recipients
 */
const calculateRefunds = async (expenses) => {
    const refunds = [];

    for (const expense of expenses) {
        if (!expense.isRefunded) {
            const refundRecipients = await getRefundRecipients(expense);
            const creator = await User.findById(expense.creator_id).select('pseudonym');

            refunds.push({
                expense_id: expense._id,
                group_id: expense.group_id,
                creator_pseudonym: creator.pseudonym,
                refund_recipients: refundRecipients
            });
        }
    }

    return refunds;
};

/**
 * Calculates refunds based on expenses in a simplified manner
 * @param {Array} expenses The array of expenses for which refunds need to be calculated
 * @returns {Array} Returns an array of refund details containing creator pseudonym, recipient pseudonym, and refund amount
 */
const calculateRefundsSimplified = async (expenses) => {
    const refunds = {};

    for (const expense of expenses) {
        if (!expense.isRefunded) {
            const { creator_id, refund_recipients, amount } = expense;
            const numRecipients = refund_recipients.length;
            const refundAmountPerRecipient = amount / numRecipients;

            for (const recipient of refund_recipients) {
                if (!refunds[creator_id]) {
                    refunds[creator_id] = {};
                }
                if (!refunds[creator_id][recipient]) {
                    refunds[creator_id][recipient] = 0;
                }

                refunds[creator_id][recipient] += refundAmountPerRecipient;
            }
        }
    }

    const refundsArray = [];

    for (const creator_id of Object.keys(refunds)) {
        const creator = await User.findById(creator_id).select('pseudonym');
        for (const recipient_id of Object.keys(refunds[creator_id])) {
            const recipient = await User.findById(recipient_id).select('pseudonym');
            refundsArray.push({
                creator_pseudonym: creator.pseudonym,
                recipient_pseudonym: recipient.pseudonym,
                refund_amount: refunds[creator_id][recipient_id]
            });
        }
    }

    return refundsArray;
};

/**
 * Retrieves refunds for a specific group based on expenses
 * @param {Object} req The request object containing the group ID in req.params.groupId, the user ID in req.userId, and the simplified query parameter in req.query.simplified
 * @param {Object} res The response object to send the calculated refunds or an error message
 * @returns {Object} Returns the calculated refunds for the group or an error message if unable to retrieve refunds
 */
const getRefunds = async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.userId;
    const simplified = req.query.simplified === 'true';

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const isMember = await GroupMembership.exists({ user_id: userId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        const expenses = await Expense.find({ group_id: groupId });
        let refunds = [];

        if (simplified) {
            refunds = await calculateRefundsSimplified(expenses);
        } else {
            refunds = await calculateRefunds(expenses);
        }

        res.status(200).json(refunds);
    } catch (error) {
        console.error('Error fetching the refunds:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { getRefunds };
