const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    value: String,
    key: Number,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    // Dùng để thêm thời gian tạo và cập nhật sản phẩm tự động
    timestamps: true
});
const Tag = mongoose.model('Tag', tagSchema, 'tags');
module.exports =  Tag;