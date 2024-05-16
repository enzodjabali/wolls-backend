const Expense = require('../models/Expense');
const GroupMembership = require("../models/GroupMembership");
const LOCALE = require('../locales/fr-FR');

/**
 * Calculates refund recipients and their corresponding refund amounts for a given expense
 * @param {Object} expense The expense object containing amount and refund recipients
 * @returns {Array} Returns an array of refund objects containing recipient ID and refund amount
 */
const getRefundRecipients = (expense) => {
    const { amount, refund_recipients } = expense;
    const numRecipients = refund_recipients.length;

    if (numRecipients === 0) {
        return [];
    }

    const refundAmountPerRecipient = amount / numRecipients;

    return refund_recipients.map(recipient => ({
        recipient_id: recipient,
        refund_amount: refundAmountPerRecipient
    }));
};

/**
 * Calculates refunds based on expenses
 * @param {Array} expenses The array of expenses for which refunds need to be calculated
 * @returns {Array} Returns an array of refund details containing expense ID, group ID, creator ID, and refund recipients
 */
const calculateRefunds = (expenses) => {
    const refunds = [];

    expenses.forEach((expense) => {
        const refundRecipients = getRefundRecipients(expense);

        refunds.push({
            expense_id: expense._id,
            group_id: expense.group_id,
            creator_id: expense.creator_id,
            refund_recipients: refundRecipients
        });
    });

    return refunds;
};

/**
 * Calculates refunds based on expenses in a simplified manner
 * @param {Array} expenses The array of expenses for which refunds need to be calculated
 * @returns {Array} Returns an array of refund details containing creator ID, recipient ID, and refund amount
 */
const calculateRefundsSimplified = (expenses) => {
    const refunds = {};

    expenses.forEach((expense) => {
        const { creator_id, refund_recipients, amount } = expense;
        const numRecipients = refund_recipients.length;

        const refundAmountPerRecipient = amount / numRecipients;

        refund_recipients.forEach(recipient => {
            if (!refunds[creator_id]) {
                refunds[creator_id] = {};
            }
            if (!refunds[creator_id][recipient]) {
                refunds[creator_id][recipient] = 0;
            }

            refunds[creator_id][recipient] += refundAmountPerRecipient;
        });
    });

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
        const isMember = await GroupMembership.exists({ user_id: userId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        const expenses = await Expense.find({ group_id: groupId });
        let refunds = [];

        if (simplified) {
            refunds = calculateRefundsSimplified(expenses);
        } else {
            refunds = calculateRefunds(expenses);
        }

        res.status(200).json(refunds);
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { getRefunds };
