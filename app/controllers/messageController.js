const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const GroupMembership = require('../models/GroupMembership');
const LOCALE = require('../locales/en-EN');
const { sendPrivateMessageSchema, sendGroupMessageSchema } = require('../middlewares/validationSchema');

const mongoose = require('mongoose');

/**
 * Sends a private message from one user to another
 * @param {Object} req The request object containing recipientId and message in req.body
 * @param {Object} res The response object to send the result
 * @returns {Object} Returns the saved message if successful, otherwise returns an error response
 */
const sendPrivateMessage = async (req, res) => {
    try {
        await sendPrivateMessageSchema.validateAsync(req.body, { abortEarly: false });

        const { recipientId, message } = req.body;
        const recipientUser = await User.findById(recipientId);
        const senderId = req.userId;

        if (!recipientUser) {
            return res.status(404).json({ error: LOCALE.userNotFound });
        }

        try {
            const newMessage = new Message({
                senderId,
                recipientId,
                message
            });

            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error('Error saving message:', error);
            res.status(500).json({ error: LOCALE.internalServerError });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({ error: LOCALE.userNotFound });
        }

        console.error('Error sending private message:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Sends a group message to a specified group
 * @param {Object} req The request object containing groupId and message in req.body
 * @param {Object} res The response object to send the result
 * @returns {Object} Returns the saved message if successful, otherwise returns an error response
 */
const sendGroupMessage = async (req, res) => {
    try {
        await sendGroupMessageSchema.validateAsync(req.body, { abortEarly: false });

        const { groupId, message } = req.body;
        const group = await Group.findById(groupId);
        const senderId = req.userId;
        const isMember = await GroupMembership.exists({ user_id: senderId, group_id: groupId });

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        try {
            const newMessage = new Message({
                senderId,
                groupId,
                message
            });

            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error('Error saving group message:', error);
            res.status(500).json({ error: LOCALE.internalServerError });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        console.error('Error sending group message:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves private messages between the current user and a specified recipient
 * @param {Object} req The request object containing the userId in req.userId and the recipientId in req.params
 * @param {Object} res The response object to send the retrieved messages
 * @returns {Object} Returns an array of messages if successful, otherwise returns an error response
 */
const getPrivateMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const { recipientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            return res.status(400).json({ error: LOCALE.userNotFound });
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId, recipientId: recipientId },
                { senderId: recipientId, recipientId: userId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching the private messages:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves messages from a specified group
 * @param {Object} req The request object containing the groupId in req.params and the userId in req.userId
 * @param {Object} res The response object to send the retrieved messages
 * @returns {Object} Returns an array of messages if successful, otherwise returns an error response
 */
const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });
        const messages = await Message.find({ groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ error: LOCALE.notAllowedViewGroupMessages });
        }

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching the group messages:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { sendGroupMessage, sendPrivateMessage, getPrivateMessages, getGroupMessages };
