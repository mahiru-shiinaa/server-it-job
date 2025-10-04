const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userCvSchema = new Schema({
    cvName: String,
    cvUrl: String,
    idUser: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const UserCv = mongoose.model('UserCv', userCvSchema, 'user_cvs');
module.exports = UserCv;