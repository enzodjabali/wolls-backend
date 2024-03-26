const GroupMembership = require('../models/GroupMembership');
const User = require('../models/User');
const Group = require('../models/Group');

const createGroupMembership = async (req, res) => {
    const { user_pseudonym, group_id } = req.body;

    try {
        // Trouver l'utilisateur par son pseudonyme
        const user = await User.findOne({ pseudonym: user_pseudonym });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(user);
        console.log(user._id);

        // Vérifier si l'utilisateur est déjà membre du groupe
        const existingMembership = await GroupMembership.findOne({ user_id: user._id, group_id });

        if (existingMembership) {
            return res.status(400).json({ message: "User is already a member of the group" });
        }

        // Créer une nouvelle instance d'adhésion au groupe
        const newMembership = new GroupMembership({
            user_id: user._id,
            group_id
        });

        // Enregistrer la nouvelle adhésion au groupe dans la base de données
        const savedMembership = await newMembership.save();

        res.status(201).json(savedMembership); // Répondre avec l'adhésion au groupe enregistrée
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