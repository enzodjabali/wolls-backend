const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');
const Group = require('../models/Group');

const createGroupMembership = async (req, res) => {
    const { user_pseudonym, group_id } = req.body;

    try {
        const user = await User.findOne({ pseudonym: user_pseudonym });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const existingMembership = await GroupMembership.findOne({ user_id: user._id, group_id });

        if (existingMembership) {
            return res.status(400).json({ message: "L'utilisateur est déjà membre du groupe" });
        }

        const newMembership = new GroupMembership({
            user_id: user._id,
            group_id
        });

        const savedMembership = await newMembership.save();

        res.status(201).json(savedMembership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroupMembers = async (req, res) => {
    const groupId = req.params.id;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Groupe introuvable" });
        }

        const groupMemberships = await GroupMembership.find({ group_id: groupId });
        const userIds = groupMemberships.map(membership => membership.user_id);

        const groupMembers = await Promise.all(userIds.map(async userId => {
            const user = await User.findById(userId);
            const groupMembership = groupMemberships.find(membership => membership.user_id.toString() === userId.toString());
            return { ...user.toObject(), is_administrator: groupMembership.is_administrator, has_accepted_invitation: groupMembership.has_accepted_invitation };
        }));

        res.status(200).json(groupMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGroupMembership = async (req, res) => {
    const { groupId, userId } = req.params;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Groupe introuvable" });
        }

        const membership = await GroupMembership.findOne({ user_id: userId, group_id: groupId });

        if (!membership) {
            return res.status(404).json({ message: "L'utilisateur n'est pas membre du groupe" });
        }

        await GroupMembership.findByIdAndDelete(membership._id);

        res.status(200).json({ message: "L'utilisateur a été supprimé du groupe avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGroupMembership,
    getGroupMembers,
    deleteGroupMembership
};