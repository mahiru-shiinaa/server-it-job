const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    name: String,
    description: String,
    status: Boolean,
    idCompany: String,
    tags: Array,
    salary: String,
    city: Array,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    // Dùng để thêm thời gian tạo và cập nhật sản phẩm tự động
    timestamps: true
});
const Job = mongoose.model('Job', JobSchema, 'jobs');
module.exports =  Job;

