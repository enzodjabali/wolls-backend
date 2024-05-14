const Expense = require('../models/Expense');
const GroupMembership = require('../models/GroupMembership');
const minioClient = require('../middlewares/minioClient');
const { createExpenseSchema, updateExpenseSchema } = require('../middlewares/validationSchema');

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
        const expenses = await Expense.find({ group_id: groupId });

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

        // Fetch attachment from S3
        let attachmentData;
        if (expense.attachment) {
            try {
                const responseStream = await minioClient.getObject("goodfriends", expense.attachment);
                const chunks = [];
                for await (const chunk of responseStream) {
                    chunks.push(chunk);
                }
                attachmentData = Buffer.concat(chunks).toString('base64');
            } catch (error) {
                console.error("Error fetching attachment from S3:", error);
            }
        }

        // Format attachment data
        const attachment = attachmentData
            ? {
                data: `data:image/jpeg;base64,${attachmentData}`
            }
            : null;

        // Include attachment in response
        const expenseWithAttachment = {
            ...expense.toObject(),
            attachment: attachment
        };

        res.status(200).json(expenseWithAttachment);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        let expenseAttachment = "";

        if (attachment) {
            const matches = attachment.data.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
            const attachmentExtension = matches && matches[1] ? matches[1] : "jpeg";
            expenseAttachment = Math.random().toString(36).substring(2, 20) + '.' + attachmentExtension ?? "";
        }

        // Create new expense instance
        const newExpense = new Expense({
            title,
            amount,
            date,
            creator_id,
            group_id,
            category,
            refund_recipients,
            attachment: expenseAttachment
        });

        // Save the new expense to the database
        const savedExpense = await newExpense.save();

        if (expenseAttachment !== "") {
            const decodedFileContent = Buffer.from(attachment.data, 'base64');

            minioClient.putObject("goodfriends", expenseAttachment, decodedFileContent, function (error, etag) {
                if (error) {
                    console.error(error);
                    // Rollback expense creation
                    Expense.deleteOne({ _id: savedExpense._id }).exec();
                    return res.status(500).json({ error: 'Error saving image to Minio' });
                } else {
                    return res.status(201).json(savedExpense);
                }
            });
        } else {
            return res.status(201).json(savedExpense);
        }
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
