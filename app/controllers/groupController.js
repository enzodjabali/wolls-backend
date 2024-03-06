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
            administrator: currentUser._id // Assign the current user as the administrator
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
        // Find all groups
        const allGroups = await Group.find();

        res.status(200).json(allGroups); // Respond with all groups
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getGroupById = async (req, res) => {
    const groupId = req.params.id; // Extract the group ID from the request parameters

    try {
        // Find the group by its ID
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(group); // Respond with the found group
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createGroup, getAllGroups, getGroupById };