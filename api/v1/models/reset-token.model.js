const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resetTokenSchema = new Schema(
    {
        email: String,
        resetToken: String,
        expiresAt: {
            type: Date,
            expires: 280,
        },
    },
    {
        // Dùng để thêm thời gian tạo và cập nhật sản phẩm tự động
        timestamps: true,
    }
);
const ResetToken = mongoose.model("ResetToken", resetTokenSchema, "reset-tokens");
module.exports = ResetToken;