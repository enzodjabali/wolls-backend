const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');
const Group = require('../models/Group');
const LOCALE = require('../locales/en-EN');

const mongoose = require('mongoose');

/**
 * Creates group memberships for multiple users if the current user is an administrator of the group
 * @param {Object} req The request object containing invited_users and group_id in req.body and the userId in req.userId
 * @param {Object} res The response object to send the created group memberships or an error response
 * @returns {Object} Returns the created group memberships if successful, otherwise returns an error response
 */
const createGroupMembership = async (req, res) => {
    const { invited_users, group_id } = req.body;
    const currentUserId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(group_id)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const isAdmin = await GroupMembership.exists({ user_id: currentUserId, group_id, is_administrator: true });

        if (!isAdmin) {
            return res.status(403).json({ error: LOCALE.notGroupAdmin });
        }

        const users = await User.find({ pseudonym: { $in: invited_users } });

        if (users.length !== invited_users.length) {
            const notFoundUsers = invited_users.filter(pseudonym => !users.some(user => user.pseudonym === pseudonym));
            return res.status(404).json({ error: `${LOCALE.usersNotFound}: ${notFoundUsers.join(', ')}` });
        }

        const newMemberships = [];

        for (const user of users) {
            const existingMembership = await GroupMembership.findOne({ user_id: user._id, group_id });

            if (existingMembership) {
                return res.status(400).json({ error: `${user.pseudonym} is already a member of the group.` });
            }

            const newMembership = new GroupMembership({
                user_id: user._id,
                group_id
            });

            const savedMembership = await newMembership.save();
            newMemberships.push(savedMembership);
        }

        res.status(201).json(newMemberships);
    } catch (error) {
        console.error('Error creating the group memberships:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves members of a group identified by groupId
 * @param {Object} req The request object containing the groupId in req.params.id and the userId in req.userId
 * @param {Object} res The response object to send the group members or an error response
 * @returns {Object} Returns the group members if successful, otherwise returns an error response
 */
const getGroupMembers = async (req, res) => {
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

        const groupMemberships = await GroupMembership.find({ group_id: groupId });
        const acceptedMembers = groupMemberships.filter(membership => membership.has_accepted_invitation);

        const userIds = acceptedMembers.map(membership => membership.user_id);

        const groupMembers = await Promise.all(userIds.map(async userId => {
            const user = await User.findById(userId).select('_id pseudonym firstname lastname');
            const groupMembership = acceptedMembers.find(membership => membership.user_id.toString() === userId.toString());
            return {
                _id: user._id,
                pseudonym: user.pseudonym,
                firstname: user.firstname,
                lastname: user.lastname,
                is_administrator: groupMembership.is_administrator,
                has_accepted_invitation: groupMembership.has_accepted_invitation
            };
        }));

        const sortedGroupMembers = groupMembers.sort((a, b) => {
            if (a._id.toString() === currentUserId.toString()) return -1;
            if (b._id.toString() === currentUserId.toString()) return 1;
            return 0;
        });

        res.status(200).json(sortedGroupMembers);
    } catch (error) {
        console.error('Error fetching the group members:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Updates the administrator status of a group membership
 * @param {Object} req The request object containing the groupId, userId, and isAdministrator in req.params and req.body
 * @param {Object} res The response object to send success message or an error response
 * @returns {Object} Returns a success message if the membership is updated successfully, otherwise returns an error response
 */
const updateGroupMembership = async (req, res) => {
    const { groupId, userId } = req.params;
    const { is_administrator } = req.body;
    const currentUserId = req.userId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: LOCALE.userNotFound });
        }

        const currentUserMembership = await GroupMembership.findOne({ user_id: currentUserId, group_id: groupId });

        if (!currentUserMembership || !currentUserMembership.is_administrator) {
            return res.status(403).json({ error: LOCALE.notAllowedToUpdateGroupMembership });
        }

        if (currentUserId === userId) {
            return res.status(403).json({ error: LOCALE.adminCannotRevokeOwnAdminPrivilege });
        }

        const targetMembership = await GroupMembership.findOne({ user_id: userId, group_id: groupId });

        if (!targetMembership) {
            return res.status(404).json({ error: LOCALE.notGroupMember });
        }

        targetMembership.is_administrator = is_administrator;
        await targetMembership.save();

        res.status(200).json({ message: LOCALE.userAdminStatusUpdated });
    } catch (error) {
        console.error('Error updating group membership:', error);
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

        const currentUserMembership = await GroupMembership.findOne({ user_id: currentUserId, group_id: groupId });

        if (!currentUserMembership) {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveGroupMembers });
        }

        const isAdmin = currentUserMembership.is_administrator;
        const isRemovingSelf = userId === currentUserId;
        const targetIsAdmin = membership.is_administrator;

        // Check if the current user is an administrator of the group
        if (isAdmin) {
            // Count administrators in the group
            const adminCount = await GroupMembership.countDocuments({ group_id: groupId, is_administrator: true });

            if (isRemovingSelf && adminCount === 1) {
                return res.status(403).json({ error: LOCALE.adminCannotRemoveOwnMembership });
            }

            // Allow removal of another administrator's membership
            if (!isRemovingSelf || (isRemovingSelf && adminCount > 1)) {
                await GroupMembership.findByIdAndDelete(membership._id);
                return res.status(200).json({ message: LOCALE.userSuccessfullyRemovedFromGroup });
            }
        }

        // If the current user is not an administrator or removing themselves
        if (isRemovingSelf) {
            await GroupMembership.findByIdAndDelete(membership._id);
            return res.status(200).json({ message: LOCALE.userSuccessfullyRemovedFromGroup });
        } else {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveGroupMembers });
        }
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
        const groups = await Group.find({ _id: { $in: groupIds } }, '_id name'); // Select only _id and name fields

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

/**
 * Retrieves the number of invitations for the current user
 * @param {Object} req The request object containing the user ID in req.userId
 * @param {Object} res The response object to send the number of invitations or an error response
 * @returns {Object} Returns the number of invitations for the current user or an error response if unable to fetch invitations
 */
const getInvitationCount = async (req, res) => {
    const userId = req.userId;

    try {
        const invitationCount = await GroupMembership.countDocuments({ user_id: userId, has_accepted_invitation: false });
        res.status(200).json({ invitationCount });
    } catch (error) {
        console.error('Error fetching the invitation count:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves all users and indicates their membership and invitation status in a specific group
 * @param {Object} req The request object containing the groupId in req.params.id
 * @param {Object} res The response object to send the list of users with membership status or an error response
 * @returns {Object} Returns the list of users with membership status if successful, otherwise returns an error response
 */
const getAllUsersWithGroupMembershipStatus = async (req, res) => {
    const groupId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        // Fetch all users excluding those marked as deleted
        const users = await User.find({ isDeleted: { $ne: true } }).select('_id pseudonym');

        // Fetch all group memberships for the specified group
        const groupMemberships = await GroupMembership.find({ group_id: groupId });

        // Map to store membership and administrator status for each user
        const userStatusMap = new Map();

        groupMemberships.forEach(membership => {
            const userIdString = membership.user_id.toString();
            if (!userStatusMap.has(userIdString)) {
                userStatusMap.set(userIdString, {
                    has_accepted_invitation: membership.has_accepted_invitation,
                    has_pending_invitation: !membership.has_accepted_invitation,
                    is_administrator: membership.is_administrator
                });
            } else {
                // Update the existing entry to reflect administrator status
                const existingStatus = userStatusMap.get(userIdString);
                if (membership.is_administrator) {
                    existingStatus.is_administrator = true;
                }
            }
        });

        // Prepare the response with membership and administrator status
        const usersWithMembershipStatus = users.map(user => {
            const userIdString = user._id.toString();
            const membership = userStatusMap.get(userIdString);
            return {
                _id: user._id,
                pseudonym: user.pseudonym,
                has_accepted_invitation: membership ? membership.has_accepted_invitation : false,
                has_pending_invitation: membership ? membership.has_pending_invitation : false,
                is_administrator: membership ? membership.is_administrator : false
            };
        });

        res.status(200).json(usersWithMembershipStatus);
    } catch (error) {
        console.error('Error fetching users with group membership status:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { createGroupMembership, getGroupMembers, updateGroupMembership, deleteGroupMembership, getInvitations, manageInvitation, getInvitationCount, getAllUsersWithGroupMembershipStatus };
