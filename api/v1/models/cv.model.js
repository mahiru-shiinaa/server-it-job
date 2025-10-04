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
        enum: ['unread', 'read', 'replied'], // unread: chưa đọc, read: đã đọc, replied: đã phản hồi
        default: 'unread'
    },
    linkProject: String,
    linkCV: String, // URL của CV được gửi
    selectedCvId: String, // ID của CV từ user_cvs collection (nếu user đã đăng ký)
    idCompany: String,
    idJob: String,
    idUser: String, // ID của user (null nếu là khách vãng lai)
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