const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const GroupMembership = require('../models/GroupMembership');
const LOCALE = require('../locales/en-EN');
const { sendGroupMessageSchema } = require('../middlewares/validationSchema');

const mongoose = require('mongoose');
const { io } = require('../middlewares/messageSocket'); // Import the Socket.IO instance

/**
 * Sends a message to a group if the user is a member of the group.
 * @param {Object} req The request object containing groupId and content in req.body, and the userId in req.userId
 * @param {Object} res The response object to send the created message or an error response
 * @returns {Object} Returns the created message if successful, otherwise returns an error response
 */
const sendGroupMessage = async (req, res) => {
    try {
        await sendGroupMessageSchema.validateAsync(req.body, { abortEarly: false });

        const { groupId, content } = req.body;
        const senderId = req.userId;

        // Validate groupId
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        // Check if the user is a member of the group
        const isMember = await GroupMembership.exists({ user_id: senderId, group_id: groupId });
        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        // Create a new message and save it to the database
        const newMessage = new Message({
            groupId: groupId,
            senderId: senderId,
            content: content
        });

        await newMessage.save();

        // Send the message to the group via Socket.IO
        io.to(groupId).emit('group_message', newMessage);

        res.status(201).json(newMessage);
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
 * Retrieves messages from a group if the user is a member of the group.
 * Supports pagination with offset and limit.
 * @param {Object} req The request object containing groupId in req.query and userId in req.userId
 * @param {Object} res The response object to send the retrieved messages or an error response
 * @returns {Object} Returns the list of messages if successful, otherwise returns an error response
 */
const getGroupMessages = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const { offset = 0, limit = 10 } = req.query;
        const userId = req.userId;

        // Validate groupId
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        // Check if the user is a member of the group
        const isMember = await GroupMembership.exists({ user_id: userId, group_id: groupId });
        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        // Fetch messages with pagination
        const messages = await Message.find({ groupId })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .sort({ timestamp: -1 }); // Optionally sort messages by timestamp

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { sendGroupMessage, getGroupMessages };
