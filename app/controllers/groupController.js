const Group = require('../models/Group');
const User = require('../models/User');
const { createGroupSchema, updateGroupSchema} = require('../middlewares/validationSchema');

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


module.exports = { createGroup, getAllGroups };