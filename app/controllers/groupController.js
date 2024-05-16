const Group = require('../models/Group');
const User = require('../models/User');
const GroupMembership = require("../models/GroupMembership");
const LOCALE = require('../locales/fr-FR');
const { createGroupSchema, updateGroupSchema} = require('../middlewares/validationSchema');

/**
 * Creates a new group
 * @param {Object} req The request object containing the group name and description in req.body, and the userId in req.userId
 * @param {Object} res The response object to send the created group or an error response
 * @returns {Object} Returns the created group if successful, otherwise returns an error response
 */
const createGroup = async (req, res) => {
    try {
        await createGroupSchema.validateAsync(req.body);

        const { name, description } = req.body;
        const currentUser = await User.findOne({ _id: req.userId });

        if (!currentUser) {
            return res.status(404).json({ error: LOCALE.notConnected });
        }

        const newGroup = new Group({
            name,
            description,
        });

        const savedGroup = await newGroup.save();

        const groupMembership = new GroupMembership({
            user_id: currentUser._id,
            group_id: savedGroup._id,
            is_administrator: true,
            has_accepted_invitation: true
        });

        await groupMembership.save();

        res.status(201).json(savedGroup);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        }
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
        const allGroups = await Group.find({ _id: { $in: groupIds } });

        res.status(200).json(allGroups);
    } catch (error) {
        console.log(error);
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
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: LOCALE.groupNotFound });
        }

        const isMember = await GroupMembership.exists({ user_id: currentUserId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        res.status(200).json(group);
    } catch (error) {
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
        const group = await Group.findById(groupId);
        const isAdministrator = await GroupMembership.exists({ user_id: userId, group_id: groupId, is_administrator: true });

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        if (!isAdministrator) {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveGroup });
        }

        const deletedGroup = await Group.findByIdAndDelete(groupId);

        res.status(200).json(deletedGroup);
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { createGroup, getGroupsList, getGroupById, updateGroupById, deleteGroupById };
