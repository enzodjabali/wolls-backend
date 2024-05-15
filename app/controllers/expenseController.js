const Expense = require('../models/Expense');
const GroupMembership = require('../models/GroupMembership');
const minioClient = require('../middlewares/minioClient');
const { createExpenseSchema, updateExpenseSchema } = require('../middlewares/validationSchema');
const fs = require('filestream');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import uuidv4 function

// Function to get all expenses for a specific group
const getExpenses = async (req, res) => {
    const groupId = req.params.groupId; // Extract group ID from request parameters

    try {
        // Check if the current user has accepted the group invitation
        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ message: "You do not have permission to view expenses for this group" });
        }

        // Find all expenses associated with the specified group
        const expenses = await Expense.find({ group_id: groupId }).select('-attachment'); // Exclude the 'attachment' field

        res.status(200).json(expenses); // Respond with the expenses
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExpense = async (req, res) => {
    const { groupId, expenseId } = req.params;

    try {
        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ message: "You do not have permission to view this expense" });
        }

        const expense = await Expense.findOne({ _id: expenseId, group_id: groupId });

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        const bucketName = 'goodfriends';
        const fileName = expense.attachment;

        const dataChunks = [];
        const dataStream = await minioClient.getObject(bucketName, fileName);

        dataStream.on('data', function (chunk) {
            dataChunks.push(chunk);
        });

        dataStream.on('end', function () {
            const concatenatedBuffer = Buffer.concat(dataChunks);
            const base64Data = concatenatedBuffer.toString('base64');
            console.log('Base64 encoded data:', base64Data);

            // Send the Base64 data back to the user
            res.status(200).json({
                expense: {
                    ...expense.toObject(),
                    attachment: {
                        fileName,
                        content: base64Data
                    }
                }
            });
        });

        dataStream.on('error', function (err) {
            console.error('Error while streaming data:', err);
            res.status(500).json({ message: "Error fetching attachment data" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createExpense = async (req, res) => {
    try {
        // Validate request body
        await createExpenseSchema.validateAsync(req.body);

        // Extract data from request body
        const { title, amount, category, group_id, refund_recipients, attachment } = req.body;
        const creator_id = req.userId;
        const date = Date.now(); // Set current date

        // Check if the current user is a member of the group
        const isMember = await GroupMembership.exists({ user_id: creator_id, group_id });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Upload file to Minio S3
        if (!attachment || !attachment.content) {
            return res.status(400).json({ message: "Attachment data is missing" });
        }

        const base64Data = attachment.content;
        const decodedFileContent = Buffer.from(base64Data, 'base64');

        const bucketName = 'goodfriends';
        const fileName = `${uuidv4()}${path.extname(attachment.filename)}`; // Generate unique filename using uuidv4
        const metaData = {
            'Content-Type': 'application/octet-stream' // Set content type as binary
        };

        await minioClient.putObject(bucketName, fileName, decodedFileContent, decodedFileContent.length, metaData);

        // Save the filename (UUID with extension) in the database under the attachment field
        const newExpense = new Expense({
            title,
            amount,
            date,
            creator_id,
            group_id,
            category,
            refund_recipients,
            attachment: fileName // Save attachment filename (UUID with extension) to database
        });

        // Save the new expense to the database
        const savedExpense = await newExpense.save();

        return res.status(201).json(savedExpense);
    } catch (error) {
        // Handle validation errors
        if (error.isJoi) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            return res.status(500).json({ message: error.message });
        }
    }
};

// Edit expense
const updateExpense = async (req, res) => {
    const expenseId = req.params.id; // Extract expense ID from request parameters

    try {
        // Validate request body
        await updateExpenseSchema.validateAsync(req.body);

        // Find expense by ID
        let expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Check if the current user is the creator of the expense
        if (expense.creator_id != req.userId) {
            return res.status(403).json({ message: "You do not have permission to edit this expense" });
        }

        // Update expense data
        const { title, amount, category, refund_recipients } = req.body;
        expense.title = title;
        expense.amount = amount;
        expense.category = category;
        expense.refund_recipients = refund_recipients;

        // Save updated expense to the database
        const updatedExpense = await expense.save();

        // Respond with the updated expense
        res.status(200).json(updatedExpense);
    } catch (error) {
        // Handle validation errors
        if (error.isJoi) {
            res.status(400).json({ message: error.details[0].message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    const expenseId = req.params.id; // Extract expense ID from request parameters

    try {
        // Find expense by ID
        let expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Check if the current user is the creator of the expense
        if (expense.creator_id != req.userId) {
            return res.status(403).json({ message: "You do not have permission to delete this expense" });
        }

        // Delete expense
        await Expense.findByIdAndDelete(expenseId);

        // Respond with success message
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense };
