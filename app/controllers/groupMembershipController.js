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

        // Check if the current user is the administrator of the group
        const groupMembership = await GroupMembership.findOne({
            user_id: req.userId,
            group_id,
            is_administrator: true
        });

        if (!groupMembership) {
            return res.status(403).json({ message: "You are not authorized to add members to this group" });
        }

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

const getGroupMembers = async (req, res) => {
    const groupId = req.params.id;

    try {
        // Find the group by its ID
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Find all group memberships for the current group
        const groupMemberships = await GroupMembership.find({ group_id: groupId });

        // Extract user IDs from group memberships
        const userIds = groupMemberships.map(membership => membership.user_id);

        // Find users with IDs that match group memberships
        const groupMembers = await Promise.all(userIds.map(async userId => {
            const user = await User.findById(userId);
            const groupMembership = groupMemberships.find(membership => membership.user_id.toString() === userId.toString());
            return { ...user.toObject(), is_administrator: groupMembership.is_administrator };
        }));

        res.status(200).json(groupMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGroupMembership,
    getGroupMembers
};