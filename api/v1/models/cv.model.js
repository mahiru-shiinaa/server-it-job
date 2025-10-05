const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cvSchema = new Schema({
    name: String,
    phone: String,
    email: String,
    city: String,
    description: String,
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    },
    linkProject: String,
    linkCV: String, // URL của CV - bắt buộc cho cả user và guest
    idCompany: {
        type: Schema.Types.ObjectId,
        ref: "Company"
    },
    idJob: {
        type: Schema.Types.ObjectId,
        ref: "Job"
    },
    idUser: String, // null nếu là khách vãng lai
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

const Cv = mongoose.model('Cv', cvSchema, 'cv');
module.exports = Cv;