const Expense = require('../models/Expense');
const GroupMembership = require('../models/GroupMembership');
const LOCALE = require('../locales/en-EN');
const minioClient = require('../middlewares/minioClient');
const { createExpenseSchema, updateExpenseSchema } = require('../middlewares/validationSchema');

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

/**
 * Retrieves all expenses associated with a specific group if the current user is a member and has accepted the group invitation
 * @param {Object} req The request object containing the groupId in req.params.groupId and the userId in req.userId
 * @param {Object} res The response object to send the expenses or an error response
 * @returns {Object} Returns the expenses if successful and the current user is a member who has accepted the group invitation, otherwise returns an error response
 */
const getExpenses = async (req, res) => {
    const groupId = req.params.groupId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ error: LOCALE.notAllowedToViewGroupExpenses });
        }

        // Retrieve expenses sorted by date in descending order
        const expenses = await Expense.find({ group_id: groupId })
            .sort({ date: -1 }) // Sort by date in descending order
            .populate({
                path: 'creator_id',
                select: 'pseudonym'
            })
            .select('-attachment');

        // Transform the expenses array to include creator_pseudonym field
        const transformedExpenses = expenses.map(expense => {
            return {
                ...expense.toObject(),
                creator_id: expense.creator_id._id,
                creator_pseudonym: expense.creator_id.pseudonym
            };
        });

        res.status(200).json(transformedExpenses);
    } catch (error) {
        console.error('Error fetching the expenses:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Retrieves details of a specific expense within a group if the current user is a member and has accepted the group invitation
 * @param {Object} req The request object containing the groupId and expenseId in req.params and the userId in req.userId
 * @param {Object} res The response object to send the expense details or an error response
 * @returns {Object} Returns the expense details if successful and the current user is a member who has accepted the group invitation, otherwise returns an error response
 */
const getExpense = async (req, res) => {
    const { groupId, expenseId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return res.status(400).json({ error: LOCALE.expenseNotFound });
        }

        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            return res.status(403).json({ error: LOCALE.notAllowedToViewExpenseDetails });
        }

        const expense = await Expense.findOne({ _id: expenseId, group_id: groupId });

        if (!expense) {
            return res.status(404).json({ error: LOCALE.expenseNotFound });
        }

        const bucketName = 'expense-attachments';
        const fileName = expense.attachment;

        if (!fileName) {
            return res.status(200).json({ expense });
        }

        const dataChunks = [];
        const dataStream = await minioClient.getObject(bucketName, fileName);

        dataStream.on('data', function (chunk) {
            dataChunks.push(chunk);
        });

        dataStream.on('end', function () {
            const concatenatedBuffer = Buffer.concat(dataChunks);
            const base64Data = concatenatedBuffer.toString('base64');

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

        dataStream.on('error', function (error) {
            console.error('Error fetching the expense attachment:', error);
            res.status(500).json({ error: LOCALE.internalServerError });
        });
    } catch (error) {
        console.error('Error fetching the expense:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

/**
 * Creates a new expense if the current user is a member of the group
 * @param {Object} req The request object containing expense details in req.body and the userId in req.userId
 * @param {Object} res The response object to send the created expense or an error response
 * @returns {Object} Returns the created expense if successful and the current user is a member of the group, otherwise returns an error response
 */
const createExpense = async (req, res) => {
    try {
        // Preprocess the amount to handle comma as decimal separator
        if (req.body.amount) {
            req.body.amount = String(req.body.amount).replace(',', '.');
        }

        await createExpenseSchema.validateAsync(req.body);

        const { title, amount, category, group_id, refund_recipients, attachment } = req.body;
        const creator_id = req.userId;
        const date = Date.now();

        const isMember = await GroupMembership.exists({ user_id: creator_id, group_id });

        if (!isMember) {
            return res.status(403).json({ error: LOCALE.notGroupMember });
        }

        let fileName = null;

        if (attachment && attachment.content) {
            const base64Data = attachment.content;
            const decodedFileContent = Buffer.from(base64Data, 'base64');

            const bucketName = 'expense-attachments';
            fileName = `${uuidv4()}${path.extname(attachment.filename)}`;
            const metaData = {
                'Content-Type': 'application/octet-stream'
            };

            await minioClient.putObject(bucketName, fileName, decodedFileContent, decodedFileContent.length, metaData);
        }

        const newExpense = new Expense({
            title,
            amount: amount,
            date,
            creator_id,
            group_id,
            category,
            refund_recipients,
            attachment: fileName
        });

        const savedExpense = await newExpense.save();

        return res.status(201).json(savedExpense);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        } else {
            console.error('Error creating the expense:', error);
            return res.status(500).json({ error: LOCALE.internalServerError });
        }
    }
};

/**
 * Updates an expense if the current user is the creator of the expense
 * @param {Object} req The request object containing the expense details in req.body and the userId in req.userId
 * @param {Object} res The response object to send the updated expense or an error response
 * @returns {Object} Returns the updated expense if successful and the current user is the creator of the expense, otherwise returns an error response
 */
const updateExpense = async (req, res) => {
    const expenseId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return res.status(400).json({ error: LOCALE.expenseNotFound });
        }

        // Preprocess the amount to handle comma as decimal separator
        if (req.body.amount) {
            req.body.amount = String(req.body.amount).replace(',', '.');
        }

        await updateExpenseSchema.validateAsync(req.body);

        let expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ error: LOCALE.expenseNotFound });
        }

        if (expense.creator_id != req.userId) {
            return res.status(403).json({ error: LOCALE.notAllowedToEditExpense });
        }

        const allowedFields = ['title', 'amount', 'category', 'refund_recipients', 'attachment', 'isRefunded'];
        Object.keys(req.body).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete req.body[key];
            }
        });

        if (req.body.attachment && req.body.attachment.content) {
            if (expense.attachment) {
                const bucketName = 'expense-attachments';
                await minioClient.removeObject(bucketName, expense.attachment);
            }

            const attachment = req.body.attachment;
            const base64Data = attachment.content;
            const decodedFileContent = Buffer.from(base64Data, 'base64');

            const bucketName = 'expense-attachments';
            const fileName = `${uuidv4()}${path.extname(attachment.filename)}`;
            const metaData = {
                'Content-Type': 'application/octet-stream'
            };

            try {
                await minioClient.putObject(bucketName, fileName, decodedFileContent, decodedFileContent.length, metaData);
            } catch (uploadError) {
                console.error('Error uploading attachment:', uploadError);
                return res.status(500).json({ error: LOCALE.attachmentUploadError });
            }

            req.body.attachment = fileName;
        }

        Object.assign(expense, req.body);

        const updatedExpense = await expense.save();
        res.status(200).json(updatedExpense);
    } catch (error) {
        if (error.isJoi) {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error updating expense:', error.message);
            res.status(500).json({ error: LOCALE.internalServerError });
        }
    }
};

/**
 * Deletes an expense if the current user is the creator of the expense
 * @param {Object} req The request object containing the expense ID in req.params.id and the userId in req.userId
 * @param {Object} res The response object to send the success message or an error response
 * @returns {Object} Returns a success message if the expense is successfully deleted, otherwise returns an error response
 */
const deleteExpense = async (req, res) => {
    const expenseId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return res.status(400).json({ error: LOCALE.expenseNotFound });
        }

        let expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ error: LOCALE.expenseNotFound });
        }

        if (expense.creator_id != req.userId) {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveExpense });
        }

        if (expense.attachment) {
            const bucketName = 'expense-attachments';
            await minioClient.removeObject(bucketName, expense.attachment);
        }

        await Expense.findByIdAndDelete(expenseId);

        res.status(200).json({ message: LOCALE.expenseSuccessfullyDeleted });
    } catch (error) {
        console.error('Error deleting the expense:', error);
        res.status(500).json({ message: LOCALE.internalServerError });
    }
};

/**
 * Deletes the attachment of an expense if the current user is the creator of the expense
 * @param {Object} req The request object containing the expense ID in req.params.id and the userId in req.userId
 * @param {Object} res The response object to send the success message or an error response
 * @returns {Object} Returns a success message if the attachment is successfully deleted, otherwise returns an error response
 */
const deleteExpenseAttachment = async (req, res) => {
    const expenseId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return res.status(400).json({ error: LOCALE.expenseNotFound });
        }

        let expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ error: LOCALE.expenseNotFound });
        }

        if (expense.creator_id != req.userId) {
            return res.status(403).json({ error: LOCALE.notAllowedToRemoveAttachment });
        }

        if (!expense.attachment) {
            return res.status(400).json({ error: LOCALE.noAttachmentFound });
        }

        // Delete attachment from S3
        const bucketName = 'expense-attachments';
        await minioClient.removeObject(bucketName, expense.attachment);

        // Update expense document to remove attachment
        expense.attachment = null;
        await expense.save();

        res.status(200).json({ message: LOCALE.expenseAttachmentSuccessfullyDeleted });
    } catch (error) {
        console.error('Error deleting the expense attachment:', error);
        res.status(500).json({ message: LOCALE.internalServerError });
    }
};

/**
 * Retrieves the total expenses made by the current user and the total expenses of the group
 * @param {Object} req The request object containing the groupId in req.params.groupId and the userId in req.userId
 * @param {Object} res The response object to send the total expenses or an error response
 * @returns {Object} Returns the total expenses made by the current user and the total expenses of the group if successful, otherwise returns an error response
 */
const getGroupExpensesAmounts = async (req, res) => {
    const groupId = req.params.groupId;

    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            console.error('Invalid groupId:', groupId);
            return res.status(400).json({ error: LOCALE.groupNotFound });
        }

        const membership = await GroupMembership.findOne({ user_id: req.userId, group_id: groupId });

        if (!membership || !membership.has_accepted_invitation) {
            console.error('User is not a member of the group or hasn\'t accepted invitation:', req.userId, groupId);
            return res.status(403).json({ error: LOCALE.notAllowedToViewGroupExpenses });
        }

        const userExpenses = await Expense.aggregate([
            { $match: { creator_id: new mongoose.Types.ObjectId(req.userId), group_id: new mongoose.Types.ObjectId(groupId) } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        const groupExpenses = await Expense.aggregate([
            { $match: { group_id: new mongoose.Types.ObjectId(groupId) } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        const userTotalAmount = userExpenses.length > 0 ? userExpenses[0].totalAmount : 0;
        const groupTotalAmount = groupExpenses.length > 0 ? groupExpenses[0].totalAmount : 0;

        res.status(200).json({ userTotalAmount, groupTotalAmount });
    } catch (error) {
        console.error('Error fetching the expense sums:', error);
        res.status(500).json({ error: LOCALE.internalServerError });
    }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, deleteExpenseAttachment, getGroupExpensesAmounts };
