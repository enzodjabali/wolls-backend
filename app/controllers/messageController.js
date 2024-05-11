const Message = require('../models/Message');
const GroupMembership = require('../models/GroupMembership');
const { sendMessageSchema } = require('../middlewares/validationSchema');

const sendPrivateMessage = async (req, res) => {
    try {
        await sendMessageSchema.validateAsync(req.body);

        const { recipientId, message } = req.body;
        const senderId = req.userId; // Assuming user is authenticated

        try {
            const newMessage = new Message({
                senderId,
                recipientId,
                message
            });

            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendGroupMessage = async (req, res) => {
    try {
        await sendMessageSchema.validateAsync(req.body);

        const { groupId, message } = req.body;
        const senderId = req.userId; // Assuming user is authenticated

        try {
            const newMessage = new Message({
                senderId,
                groupId,
                message
            });

            const savedMessage = await newMessage.save();
            res.status(201).json(savedMessage);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPrivateMessages = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user is authenticated
        const recipientId = req.params.recipientId; // Correct extraction

        // Fetch messages where either the sender or the recipient is the current user
        const messages = await Message.find({
            $or: [
                { senderId: userId, recipientId: recipientId },
                { senderId: recipientId, recipientId: userId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Check if the current user has accepted the group invitation
        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ message: "You do not have permission to view expenses for this group" });
        }

        const messages = await Message.find({ groupId });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendGroupMessage, sendPrivateMessage, getPrivateMessages, getGroupMessages };
