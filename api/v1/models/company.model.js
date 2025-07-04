const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    companyName: String,
    description: String,
    phone: String,
    email: String,
    address: String,
    password: String,
    token: String,
    quantityPeople: Number,
    detail: String,
    workingTime: String,
    website: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    // Dùng để thêm thời gian tạo và cập nhật sản phẩm tự động
    timestamps: true
});
const Company = mongoose.model('Company', companySchema, 'companys');
module.exports =  Company;