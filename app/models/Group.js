const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    administrator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
