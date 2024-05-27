const Expense = require('../models/Expense');
const GroupMembership = require("../models/GroupMembership");
const User = require('../models/User'); // Import User model
const LOCALE = require('../locales/en-GB');
const mongoose = require("mongoose");

/**
 * Calculates refund recipients and their corresponding refund amounts for a given expense
 * @param {Object} expense The expense object containing amount and refund recipients
 * @returns {Array} Returns an array of refund objects containing recipient pseudonym and refund amount
 */
const getRefundRecipients = async (expense, creatorPseudonym) => {
    const { amount, refund_recipients } = expense;
    const numRecipients = refund_recipients.length;

    if (numRecipients === 0) {
        return [];
    }

    const refundAmountPerRecipient = amount / numRecipients;
    const recipients = await User.find({ _id: { $in: refund_recipients } }).select('pseudonym');

    return recipients
        .filter(recipient => recipient.pseudonym !== creatorPseudonym)
        .map(recipient => ({
            recipient_pseudonym: recipient.pseudonym,
            refund_amount: refundAmountPerRecipient
        }));
};

/**
 * Calculates refunds based on expenses
 * @param {Array} expenses The array of expenses for which refunds need to be calculated
 * @returns {Array} Returns an array of refund details containing expense ID, group ID, creator pseudonym, expense title, expense category, and refund recipients
 */
const calculateRefunds = async (expenses) => {
    const refunds = [];

    for (const expense of expenses) {
        if (!expense.isRefunded) {
            const creator = await User.findById(expense.creator_id).select('pseudonym');
            const refundRecipients = await getRefundRecipients(expense, creator.pseudonym);

            if (refundRecipients.length > 0) {
                refunds.push({
                    expense_id: expense._id,
                    group_id: expense.group_id,
                    creator_pseudonym: creator.pseudonym,
                    expense_title: expense.title,
                    expense_category: expense.category,
                    refund_recipients: refundRecipients
                });
            }
        }
    }

    return refunds;
};

const calculateRefundsSimplified = async (expenses) => {
    const refunds = {};

    for (const expense of expenses) {
        if (!expense.isRefunded) {
            const { creator_id, refund_recipients, amount } = expense;
            const numRecipients = refund_recipients.length;
            const refundAmountPerRecipient = amount / numRecipients;
            const creator = await User.findById(creator_id).select('pseudonym');

            for (const recipient of refund_recipients) {
                const recipientUser = await User.findById(recipient).select('pseudonym');
                if (creator.pseudonym === recipientUser.pseudonym) {
                    continue; // Skip if the creator is the recipient
                }

                const key = `${creator.pseudonym}-${recipientUser.pseudonym}`;
                if (!refunds[key]) {
                    refunds[key] = 0;
                }

                refunds[key] += refundAmountPerRecipient;
            }
        }
    }

    const refundsArray = [];

    for (const key of Object.keys(refunds)) {
        const [creatorPseudonym, recipientPseudonym] = key.split('-');
        const refundAmount = refunds[key];

        if (refundAmount > 0) {
            refundsArray.push({
                creator_pseudonym: creatorPseudonym,
                recipient_pseudonym: recipientPseudonym,
                refund_amount: refundAmount
            });
        }
    }

    const simplifiedRefunds = {};

    refundsArray.forEach(refund => {
        const { creator_pseudonym, recipient_pseudonym, refund_amount } = refund;
        const key = `${creator_pseudonym}-${recipient_pseudonym}`;

        if (!simplifiedRefunds[key]) {
            simplifiedRefunds[key] = 0;
        }

        const reverseKey = `${recipient_pseudonym}-${creator_pseudonym}`;
        const reverseRefund = simplifiedRefunds[reverseKey] || 0;

        if (refund_amount > reverseRefund) {
            simplifiedRefunds[key] = refund_amount - reverseRefund;
            delete simplifiedRefunds[reverseKey];
        } else if (reverseRefund > refund_amount) {
            simplifiedRefunds[reverseKey] = reverseRefund - refund_amount;
            delete simplifiedRefunds[key];
        }
    });

    const simplifiedRefundsArray = [];

    for (const key of Object.keys(simplifiedRefunds)) {
        const [creatorPseudonym, recipientPseudonym] = key.split('-');
        const refundAmount = simplifiedRefunds[key];

        if (refundAmount > 0) {
            simplifiedRefundsArray.push({
                creator_pseudonym: creatorPseudonym,
                recipient_pseudonym: recipientPseudonym,
                refund_amount: refundAmount
            });
        }
    }

    return simplifiedRefundsArray;
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
