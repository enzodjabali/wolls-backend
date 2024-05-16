const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const GroupMembership = require('../models/GroupMembership');
const { sendPrivateMessageSchema, sendGroupMessageSchema } = require('../middlewares/validationSchema');
const LOCALE = require('../locales/fr-FR');

const sendPrivateMessage = async (req, res) => {
    try {
        await sendPrivateMessageSchema.validateAsync(req.body, { abortEarly: false });

        const { recipientId, message } = req.body;
        const senderId = req.userId; // Assuming user is authenticated

        // Check if the recipient user exists
        const recipientUser = await User.findById(recipientId);

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
        // Handle Joi validation errors separately
        if (error.name === 'ValidationError') {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        // Handle CastError specifically
        if (error.name === 'CastError') {
            return res.status(400).json({ error: LOCALE.userNotFound });
        }

        // Handle other errors
        console.error('Error sending private message:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

const mongoose = require('mongoose');

const sendGroupMessage = async (req, res) => {
    try {
        await sendGroupMessageSchema.validateAsync(req.body, { abortEarly: false });

        const { groupId, message } = req.body;
        const senderId = req.userId; // Assuming user is authenticated

        // Check if the groupId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        // Check if the group exists
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        // Check if the current user is a member of the group
        const isMember = await GroupMembership.exists({ user_id: senderId, group_id: groupId });

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
        // Handle Joi validation errors separately
        if (error.name === 'ValidationError') {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        // Handle other errors
        console.error('Error sending group message:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

const getPrivateMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const { recipientId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: userId, recipientId: recipientId },
                { senderId: recipientId, recipientId: userId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Check if the current user has accepted the group invitation
        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ error: LOCALE.notAllowedViewGroupMessages });
        }

        const messages = await Message.find({ groupId });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { sendGroupMessage, sendPrivateMessage, getPrivateMessages, getGroupMessages };
