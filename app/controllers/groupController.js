const Group = require('../models/Group');
const User = require('../models/User');
const { createGroupSchema, updateGroupSchema} = require('../middlewares/validationSchema');
const GroupMembership = require("../models/GroupMembership");

const createGroup = async (req, res) => {
    await createGroupSchema.validateAsync(req.body);

    const { name, description } = req.body;

    try {
        // Find the current user
        const currentUser = await User.findOne({ _id: req.userId });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new group instance
        const newGroup = new Group({
            name,
            description,
        });

        // Save the new group to the database
        const savedGroup = await newGroup.save();

        // Create a group membership entry for the current user and set them as the administrator
        const groupMembership = new GroupMembership({
            user_id: currentUser._id,
            group_id: savedGroup._id,
            is_administrator: true, // Set the current user as the administrator
            has_accepted_invitation: true
        });

        await groupMembership.save(); // Save the group membership entry

        res.status(201).json(savedGroup); // Respond with the saved group
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllGroups = async (req, res) => {
    try {
        // Find all group memberships of the current user that have been accepted
        const userGroupMemberships = await GroupMembership.find({
            user_id: req.userId,
            has_accepted_invitation: true
        });

        // Extract the IDs of the groups from the user's group memberships
        const groupIds = userGroupMemberships.map(membership => membership.group_id);

        // Find all groups with IDs that match the user's group memberships
        const allGroups = await Group.find({ _id: { $in: groupIds } });

        res.status(200).json(allGroups); // Respond with groups that the current user has accepted invitations for
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getGroupById = async (req, res) => {
    const groupId = req.params.id; // Extract the group ID from the request parameters
    const currentUserId = req.userId; // Extract the current user's ID from the request

    try {
        // Find the group by its ID
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if the current user is a member of this group
        const isMember = await GroupMembership.exists({ user_id: currentUserId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        res.status(200).json(group); // Respond with the found group
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGroupById = async (req, res) => {
    const groupId = req.params.id;
    const currentUserId = req.userId; // Assuming you have middleware to extract the user's ID from the request

    try {
        // Validate the request body
        await updateGroupSchema.validateAsync(req.body);

        // Check if the user is an administrator of the group
        const isAdmin = await GroupMembership.exists({ user_id: currentUserId, group_id: groupId, is_administrator: true });

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not an administrator of this group" });
        }

        // Find and update the group by its ID
        const updatedGroup = await Group.findByIdAndUpdate(groupId, {
            name: req.body.name,
            description: req.body.description
        }, { new: true }); // Set { new: true } to return the updated document

        // Check if the group was found and updated
        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGroupById = async (req, res) => {
    const groupId = req.params.id;
    const userId = req.userId; // Assuming user is authenticated

    try {
        // Find the group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the current user is an administrator of the group
        const isAdministrator = await GroupMembership.exists({ user_id: userId, group_id: groupId, is_administrator: true });

        if (!isAdministrator) {
            return res.status(403).json({ message: 'You are not authorized to delete this group' });
        }

        // Delete the group
        const deletedGroup = await Group.findByIdAndDelete(groupId);

        res.status(200).json(deletedGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createGroup, getAllGroups, getGroupById, updateGroupById, deleteGroupById };