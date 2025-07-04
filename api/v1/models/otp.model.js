const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema(
  {
    email: String,
    otp: String,
    type: String,
    expiresAt: {
      type: Date,
      expires: 300,
    },
  },
  {
    // Dùng để thêm thời gian tạo và cập nhật sản phẩm tự động
    timestamps: true,
  }
);
const Otp = mongoose.model("Otp", otpSchema, "otps");
module.exports = Otp;
