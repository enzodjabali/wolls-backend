const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const GroupMembership = require("../models/GroupMembership");
const LOCALE = require('../locales/en-GB');
const minioClient = require('../middlewares/minioClient');
const { createGroupSchema, updateGroupSchema} = require('../middlewares/validationSchema');

const mongoose = require('mongoose');

/**
 * Creates a new group
 * @param {Object} req The request object containing the group name and description in req.body, and the userId in req.userId
 * @param {Object} res The response object to send the created group or an error response
 * @returns {Object} Returns the created group if successful, otherwise returns an error response
 */
const createGroup = async (req, res) => {
    try {
        await createGroupSchema.validateAsync(req.body);

        const { name, description, invited_users = [] } = req.body;
        const currentUser = await User.findOne({ _id: req.userId });

        if (!currentUser) {
            return res.status(404).json({ error: LOCALE.notConnected });
        }

        const themes = ['city', 'desert', 'forest'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        const newGroup = new Group({
            name,
            description,
            theme: randomTheme,
        });

        const savedGroup = await newGroup.save();

        const groupMembership = new GroupMembership({
            user_id: currentUser._id,
            group_id: savedGroup._id,
            is_administrator: true,
            has_accepted_invitation: true
        });

        await groupMembership.save();

        for (const pseudonym of invited_users) {
            const user = await User.findOne({ pseudonym });

            if (user) {
                const existingMembership = await GroupMembership.findOne({
                    user_id: user._id,
                    group_id: savedGroup._id,
                });

                if (!existingMembership) {
                    const newMembership = new GroupMembership({
                        user_id: user._id,
                        group_id: savedGroup._id,
                        has_accepted_invitation: false
                    });

                    await newMembership.save();
                }
            }
        }

        res.status(201).json(savedGroup);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        }
        console.error('Error creating the group:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves all groups that the current user has accepted invitations for
 * @param {Object} req The request object containing the userId in req.userId
 * @param {Object} res The response object to send the groups or an error response
 * @returns {Object} Returns the groups that the current user has accepted invitations for if successful, otherwise returns an error response
 */
const getGroupsList = async (req, res) => {
    try {
        const userGroupMemberships = await GroupMembership.find({
            user_id: req.userId,
            has_accepted_invitation: true
        });

        const groupIds = userGroupMemberships.map(membership => membership.group_id);

        // Fetch all groups sorted by createdAt in descending order
        const allGroups = await Group.find({ _id: { $in: groupIds } })
            .sort({ createdAt: -1 });

        // Fetch administrators for each group
        const adminUsersByGroup = await GroupMembership.aggregate([
            { $match: { group_id: { $in: groupIds }, is_administrator: true } },
            {
                $group: {
                    _id: '$group_id',
                    adminUsers: { $push: '$user_id' }
                }
            }
        ]);

        // Convert the aggregation result to a more usable format
        const adminUsersMap = adminUsersByGroup.reduce((acc, { _id, adminUsers }) => {
            acc[_id] = adminUsers;
            return acc;
        }, {});

        // Format the response
        const response = allGroups.map(group => ({
            _id: group._id,
            name: group.name,
            description: group.description,
            theme: group.theme,
            createdAt: group.createdAt,
            administrators: adminUsersMap[group._id] || [],
            __v: group.__v
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching the groups:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves a group by its ID if the current user is a member of the group
 * @param {Object} req The request object containing the groupId in req.params.id and the userId in req.userId
 * @param {Object} res The response object to send the group or an error response
 * @returns {Object} Returns the group if found and the current user is a member, otherwise returns an error response
 */
const getGroupById = async (req, res) => {
    const groupId = req.params.id;
    const currentUserId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        const isMember = await GroupMembership.exists({ user_id: currentUserId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        const administrators = await GroupMembership.find({
            group_id: groupId,
            is_administrator: true
        }).select('user_id -_id');

        const adminIds = administrators.map(admin => admin.user_id);

        res.status(200).json({
            _id: group._id,
            name: group.name,
            description: group.description,
            theme: group.theme,
            createdAt: group.createdAt,
            administrators: adminIds,
            __v: group.__v
        });
    } catch (error) {
        console.error('Error fetching the group:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Updates a group by its ID if the current user is an administrator of the group
 * @param {Object} req The request object containing the groupId in req.params.id, the userId in req.userId, and the updated group data in req.body
 * @param {Object} res The response object to send the updated group or an error response
 * @returns {Object} Returns the updated group if successful, otherwise returns an error response
 */
const updateGroupById = async (req, res) => {
    const groupId = req.params.id;
    const currentUserId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        await updateGroupSchema.validateAsync(req.body, { abortEarly: false });

        const isAdmin = await GroupMembership.exists({ user_id: currentUserId, group_id: groupId, is_administrator: true });

        if (!isAdmin) {
            return res.status(403).json({ error: LOCALE.notGroupAdmin });
        }

        const updatedGroup = await Group.findByIdAndUpdate(groupId, {
            name: req.body.name,
            description: req.body.description
        }, { new: true });

        if (!updatedGroup) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ error: errorMessage });
        }

        console.error('Error updating group by ID:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Deletes a group by its ID if the current user is an administrator of the group
 * @param {Object} req The request object containing the groupId in req.params.id and the userId in req.userId
 * @param {Object} res The response object to send the deleted group or an error response
 * @returns {Object} Returns the deleted group if successful, otherwise returns an error response
 */
const deleteGroupById = async (req, res) => {
    const groupId = req.params.id;
    const userId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const group = await Group.findById(groupId);
        const isAdministrator = await GroupMembership.exists({ user_id: userId, group_id: groupId, is_administrator: true });

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        if (!isAdministrator) {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveGroup });
        }

        const expenses = await Expense.find({ group_id: groupId });

        for (const expense of expenses) {
            if (expense.attachment) {
                await minioClient.removeObject('expense-attachments', expense.attachment);
            }
        }

        await Expense.deleteMany({ group_id: groupId });
        await GroupMembership.deleteMany({ group_id: groupId });
        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ message: LOCALE.groupSuccessfullyDeleted });
    } catch (error) {
        console.error('Error deleting the group:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { createGroup, getGroupsList, getGroupById, updateGroupById, deleteGroupById };
