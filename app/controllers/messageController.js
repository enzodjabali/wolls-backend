const Message = require('../models/message');

const sendGroupMessage = async (req, res) => {
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
};

const sendPrivateMessage = async (req, res) => {
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
};

module.exports = { sendGroupMessage, sendPrivateMessage };
