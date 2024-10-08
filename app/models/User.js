const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: false
    },
    lastname: {
        type: String,
        required: false
    },
    pseudonym: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    emailPaypal: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    isGoogle: {
        type: Boolean,
        default: false
    },
    iban: {
        type: String,
        required: false,
        default: ""
    },
    ibanAttachment: {
        type: String,
        required: false
    },
    picture: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
