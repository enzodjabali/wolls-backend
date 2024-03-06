const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');
const Group = require('../models/Group');


const createGroupMembership = async (req, res) => {
    const { user_id, group_id } = req.body;

    try {
        // Find the group by its ID
        const group = await Group.findById(group_id);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // TODO: Check if the current user is the administrator of the group

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