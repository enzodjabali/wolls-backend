const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const GroupMembership = require('../models/GroupMembership');
const LOCALE = require('../locales/en-EN');
const { sendGroupMessageSchema } = require('../middlewares/validationSchema');

const mongoose = require('mongoose');
const { io, sendMessageToGroup } = require('../socket'); // Import the Socket.IO instance

// Function to send a message to a group
/**
const sendMessageToGroup = (groupId, senderId, content) => {
    const messageData = {
        groupId: groupId,
        id: new mongoose.Types.ObjectId().toString(),
        senderId: senderId,
        content: content,
    };

    // Emit the message to the group
    if (io.to(groupId).emit('group_message', messageData)) {
        console.log('Sent message from sendMessageToGroup function:', messageData);
    } else {
        console.log('cant send the message from api')
    }
};
**/
//module.exports = { sendMessageToGroup };


const sendGroupMessage = async (req, res) => {
    try {
        //await sendGroupMessageSchema.validateAsync(req.body, { abortEarly: false });

        const { groupId, content } = req.body;
        console.log(groupId)

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

        sendMessageToGroup(groupId, senderId, content);

        res.status(201).json({ success: true });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        console.error('Error sending group message:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { sendGroupMessage };
