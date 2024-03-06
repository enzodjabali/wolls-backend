const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');


const createGroupMembership = async (req, res) => {
    const { user_id, group_id } = req.body;

    try {
        // Create a new group membership instance
        const newMembership = new GroupMembership({
            user_id,
            group_id
        });

        // Save the new group membership to the database
        const savedMembership = await newMembership.save();

        res.status(201).json(savedMembership); // Respond with the saved group membership
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGroupMembership
};