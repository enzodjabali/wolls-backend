const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');
const Group = require('../models/Group');
const LOCALE = require('../locales/fr-FR');

const createGroupMembership = async (req, res) => {
    const { user_pseudonym, group_id } = req.body;
    const currentUserId = req.userId; // Assuming you have middleware to extract the user's ID from the request

    try {
        // Check if the current user is an administrator of the group
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
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

const getGroupMembers = async (req, res) => {
    const groupId = req.params.id;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        const groupMemberships = await GroupMembership.find({ group_id: groupId });
        const userIds = groupMemberships.map(membership => membership.user_id);

        const groupMembers = await Promise.all(userIds.map(async userId => {
            const user = await User.findById(userId).select('_id pseudonym firstname lastname'); // Select only _id and pseudonym
            const groupMembership = groupMemberships.find(membership => membership.user_id.toString() === userId.toString());
            return { _id: user._id, pseudonym: user.pseudonym, firstname: user.firstname, lastname: user.lastname, is_administrator: groupMembership.is_administrator, has_accepted_invitation: groupMembership.has_accepted_invitation };
        }));

        res.status(200).json(groupMembers);
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

const deleteGroupMembership = async (req, res) => {
    const { groupId, userId } = req.params;
    const currentUserId = req.userId;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: LOCALE.groupNotFound });
        }

        const membership = await GroupMembership.findOne({ user_id: userId, group_id: groupId });

        if (!membership) {
            return res.status(404).json({ error: LOCALE.notGroupMember });
        }

        // Check if the current user is an administrator of the group
        const isAdmin = await GroupMembership.exists({ user_id: currentUserId, group_id: groupId, is_administrator: true });

        if (!isAdmin) {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveGroupMembers });
        }

        await GroupMembership.findByIdAndDelete(membership._id);

        res.status(200).json({ message: LOCALE.userSuccessfullyRemovedFromGroup });
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

const getInvitations = async (req, res) => {
    const userId = req.userId;

    try {
        // Find group memberships where the user has_accepted_invitation is false
        const groupMemberships = await GroupMembership.find({ user_id: userId, has_accepted_invitation: false });

        // Extract group ids from group memberships
        const groupIds = groupMemberships.map(membership => membership.group_id);

        // Find the corresponding groups
        const groups = await Group.find({ _id: { $in: groupIds } });

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

const manageInvitation = async (req, res) => {
    const { group_id, accept_invitation } = req.body;
    const userId = req.userId;

    try {
        // Find the group membership
        const groupMembership = await GroupMembership.findOne({ user_id: userId, group_id });

        // Check if the group membership exists
        if (!groupMembership) {
            return res.status(404).json({ error: LOCALE.userHasNoInvitationForGroup });
        }

        // If accept_invitation is true, accept the invitation
        if (accept_invitation === true) {
            // Update the has_accepted_invitation field to true
            groupMembership.has_accepted_invitation = true;

            // Save the updated group membership
            await groupMembership.save();

            return res.status(200).json({ message: LOCALE.invitationAccepted });
        }

        // If accept_invitation is false, delete the invitation
        if (accept_invitation === false) {
            // Delete the group membership
            await GroupMembership.findByIdAndDelete(groupMembership._id);

            return res.status(200).json({ message: LOCALE.invitationDeleted });
        }

        // If accept_invitation is neither true nor false
        return res.status(400).json({ error: LOCALE.invalidInvitationValue });
    } catch (error) {
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = {
    createGroupMembership,
    getGroupMembers,
    deleteGroupMembership,
    getInvitations,
    manageInvitation
};