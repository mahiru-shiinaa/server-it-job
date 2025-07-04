const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cvSchema = new Schema({
    name: String,
    phone: String,
    email: String,
    city: String,
    description: String,
    statusRead: {
        type: Boolean,
        default: false
    },
    linkProject: String,
    idCompany: String,
    idJob: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    // Dùng để thêm thời gian tạo và cập nhật sản phẩm tự động
    timestamps: true
});
const Cv = mongoose.model('Cv', cvSchema, 'cv');
module.exports =  Cv;