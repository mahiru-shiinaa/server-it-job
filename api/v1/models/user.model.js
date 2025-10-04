const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: String,
    phone: String,
    email: String,
    password: String,
    token: String,
    city: String,
    address: String,
    dateOfBirth: Date,
    avatar: String,
    description: String,
    linkProject: String, // New field added
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;