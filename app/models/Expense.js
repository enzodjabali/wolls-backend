const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    creator_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group_id: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    category: {
        type: String,
        required: false
    },
    refund_recipients: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        required: true
    },
    attachment: {
        type: String,
        required: false
    },
    isRefunded: {
        type: Boolean,
        default: false
    }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
