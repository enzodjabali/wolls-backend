const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');
const Group = require('../models/Group');
const LOCALE = require('../locales/fr-FR');

const mongoose = require('mongoose');

/**
 * Creates a group membership if the current user is an administrator of the group
 * @param {Object} req The request object containing user_pseudonym and group_id in req.body and the userId in req.userId
 * @param {Object} res The response object to send the created group membership or an error response
 * @returns {Object} Returns the created group membership if successful, otherwise returns an error response
 */
const createGroupMembership = async (req, res) => {
    const { user_pseudonym, group_id } = req.body;
    const currentUserId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(group_id)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const isAdmin = await GroupMembership.exists({ user_id: currentUserId, group_id, is_administrator: true });

        if (!isAdmin) {
            return res.status(403).json({ error: LOCALE.notGroupAdmin });
        }

        const user = await User.findOne({ pseudonym: user_pseudonym });

        if (!user) {
            return res.status(404).json({ error: LOCALE.userNotFound });
        }

        const existingMembership = await GroupMembership.findOne({ user_id: user._id, group_id });

        if (existingMembership) {
            return res.status(400).json({ error: LOCALE.userAlreadyMemberOfGroup });
        }

        const newMembership = new GroupMembership({
            user_id: user._id,
            group_id
        });

        const savedMembership = await newMembership.save();

        res.status(201).json(savedMembership);
    } catch (error) {
        console.error('Error creating the group membership:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves members of a group identified by groupId
 * @param {Object} req The request object containing the groupId in req.params.id
 * @param {Object} res The response object to send the group members or an error response
 * @returns {Object} Returns the group members if successful, otherwise returns an error response
 */
const getGroupMembers = async (req, res) => {
    const groupId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        const groupMemberships = await GroupMembership.find({ group_id: groupId });
        const userIds = groupMemberships.map(membership => membership.user_id);

        const groupMembers = await Promise.all(userIds.map(async userId => {
            const user = await User.findById(userId).select('_id pseudonym firstname lastname');
            const groupMembership = groupMemberships.find(membership => membership.user_id.toString() === userId.toString());
            return { _id: user._id, pseudonym: user.pseudonym, firstname: user.firstname, lastname: user.lastname, is_administrator: groupMembership.is_administrator, has_accepted_invitation: groupMembership.has_accepted_invitation };
        }));

        res.status(200).json(groupMembers);
    } catch (error) {
        console.error('Error fetching the group members:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Deletes a group membership for a specified user in a group
 * @param {Object} req The request object containing the groupId and userId in req.params
 * @param {Object} res The response object to send success message or an error response
 * @returns {Object} Returns a success message if the membership is deleted successfully, otherwise returns an error response
 */
const deleteGroupMembership = async (req, res) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: LOCALE.userNotFound });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: LOCALE.userNotFound });
        }

        const membership = await GroupMembership.findOne({ user_id: userId, group_id: groupId });

        if (!membership) {
            return res.status(404).json({ error: LOCALE.notGroupMember });
        }

        const isAdmin = await GroupMembership.exists({ user_id: currentUserId, group_id: groupId, is_administrator: true });

        if (!isAdmin) {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveGroupMembers });
        }

        if (userId === currentUserId && isAdmin) {
            return res.status(403).json({ error: LOCALE.adminCannotRemoveOwnMembership });
        }

        await GroupMembership.findByIdAndDelete(membership._id);

        res.status(200).json({ message: LOCALE.userSuccessfullyRemovedFromGroup });
    } catch (error) {
        console.error('Error deleting a group membership:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves invitations for the current user
 * @param {Object} req The request object containing the user ID in req.userId
 * @param {Object} res The response object to send the invitations or an error response
 * @returns {Object} Returns invitations for the current user or an error response if unable to fetch invitations
 */
const getInvitations = async (req, res) => {
    const userId = req.userId;

    try {
        const groupMemberships = await GroupMembership.find({ user_id: userId, has_accepted_invitation: false });
        const groupIds = groupMemberships.map(membership => membership.group_id);
        const groups = await Group.find({ _id: { $in: groupIds } });

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching the invitations:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Manages the user's invitation to a group (accept or delete invitation)
 * @param {Object} req The request object containing the group ID and accept_invitation flag in req.body, and the user ID in req.userId
 * @param {Object} res The response object to send success or error messages
 * @returns {Object} Returns a success message if the invitation is accepted or deleted, or an error message if unable to manage the invitation
 */
const manageInvitation = async (req, res) => {
    const { group_id, accept_invitation } = req.body;
    const userId = req.userId;

    try {
        const groupMembership = await GroupMembership.findOne({ user_id: userId, group_id });

        if (!groupMembership) {
            return res.status(404).json({ error: LOCALE.userHasNoInvitationForGroup });
        }

        if (accept_invitation === true) {
            groupMembership.has_accepted_invitation = true;
            await groupMembership.save();
            return res.status(200).json({ message: LOCALE.invitationAccepted });
        }

        if (accept_invitation === false) {
            await GroupMembership.findByIdAndDelete(groupMembership._id);
            return res.status(200).json({ message: LOCALE.invitationDeleted });
        }

        return res.status(400).json({ error: LOCALE.invalidInvitationValue });
    } catch (error) {
        console.error('Error managing the invitation:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { createGroupMembership, getGroupMembers, deleteGroupMembership, getInvitations, manageInvitation };
