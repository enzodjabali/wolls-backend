const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupMembershipSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group_id: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    is_administrator: {
        type: Boolean,
        default: false
    },
    has_accepted_invitation: {
        type: Boolean,
        default: false
    }
});

const GroupMembership = mongoose.model('GroupMembership', groupMembershipSchema);

module.exports = GroupMembership;
