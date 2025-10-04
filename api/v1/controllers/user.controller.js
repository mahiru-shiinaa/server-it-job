const User = require("../models/user.model");
const UserCv = require("../models/user-cv.model");
const Cv = require("../models/cv.model");
const Otp = require("../models/otp.model");
const ResetToken = require("../models/reset-token.model");
const md5 = require("md5");
const sendMailHelper = require("../../../helpers/sendMail");
const generateHelper = require("../../../helpers/generate");

//[POST] /api/v1/users/auth/register
module.exports.register = async (req, res) => {
  try {
    const { phone, email, password, fullName } = req.body;
    
    const checkUser = await User.findOne({
      $or: [{ phone }, { email }],
    });
    
    if (checkUser?.email === email) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    if (checkUser?.phone === phone) {
      return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
    }

    req.body.password = md5(password);
    req.body.deleted = true;
    const user = new User(req.body);
    await user.save();

    const otpRandom = generateHelper.generateRandomNumber();
    const otpObject = {
      email: email,
      otp: otpRandom,
      type: "register",
      expiresAt: Date.now(),
    };
    const otp = new Otp(otpObject);
    await otp.save();
    
    const subject = "IT JOB - Mã OTP xác minh tài khoản";
    sendMailHelper.sendMail(email, subject, otpRandom);
    
    res.json({
      code: 200,
      message: "Đăng ký thành công, vui lòng xác minh tài khoản",
      email: email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/users/auth/register/checkEmailOtp
module.exports.checkEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "Vui lòng nhập otp" });
    }
    
    const otpCheck = await Otp.findOne({
      email: email,
      otp: otp,
      type: "register",
    });
    if (!otpCheck) {
      return res.status(400).json({ message: "Không tìm thấy otp" });
    }
    
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    
    const token = generateHelper.generateToken();
    user.token = token;
    user.deleted = false;
    await user.save();
    await Otp.findOneAndDelete({ email: email });
    
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ code: 200, message: "Xác minh thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Thêm vào cuối file api/v1/controllers/user.controller.js

//[POST] /api/v1/users/auth/register/resendCheckEmailOtp
module.exports.resendCheckEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    if (user.deleted === false) {
      return res
        .status(400)
        .json({ message: "Tài khoản này đã được xác minh" });
    }
    const otp = generateHelper.generateRandomNumber();
    await Otp.findOneAndDelete({ email: email, type: "register" });

    const otpObject = {
      email: email,
      otp: otp,
      type: "register",
      expiresAt: Date.now(),
    };
    const otpCheck = new Otp(otpObject);
    await otpCheck.save();
    const subject = "IT JOB - Mã OTP xác minh tài khoản";
    sendMailHelper.sendMail(email, subject, otp);
    return res.status(200).json({ code: 200, message: "Mã OTP mới được gửi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/users/auth/register/cancel-register
module.exports.cancelRegister = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email, deleted: true });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }
    await User.findOneAndDelete({ email: email, deleted: true });
    await Otp.findOneAndDelete({ email: email });
    res.status(200).json({ code: 200, message: "Hủy đăng ký thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/users/password/resendOtp
module.exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email, deleted: false });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    const otp = generateHelper.generateRandomNumber();
    await Otp.findOneAndDelete({ email: email, type: "forgot" });

    const otpObject = {
      email: email,
      otp: otp,
      type: "forgot",
      expiresAt: Date.now(),
    };
    const otpCheck = new Otp(otpObject);
    await otpCheck.save();
    const subject = "IT JOB - Mã OTP xác minh tài khoản";
    sendMailHelper.sendMail(email, subject, otp);
    return res.status(200).json({ code: 200, message: "Mã OTP mới được gửi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};


//[POST] /api/v1/users/auth/login
module.exports.login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      deleted: false,
    });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    if (user.password !== md5(req.body.password)) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }
    
    const token = user.token;
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ code: 200, message: "Login thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[GET] /api/v1/users/auth/logout
module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("userToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ code: 200, message: "Logout thành công" });
  } catch (error) {
    res.status(500).json(error);
  }
};

//[GET] /api/v1/users/me
module.exports.detail = async (req, res) => {
  try {
    res.json({
      code: 200,
      message: "Thành công",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//[PATCH] /api/v1/users/me/edit
module.exports.edit = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ code: 200, message: "Cập nhật thành công", user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[DELETE] /api/v1/users/me/delete
module.exports.delete = async (req, res) => {
  try {
    await UserCv.deleteMany({ idUser: req.user._id });
    await Cv.deleteMany({ idUser: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.clearCookie("userToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ code: 200, message: "Xóa tài khoản thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/users/me/change-password
module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findOne({ _id: req.user._id });
    
    if (user.password !== md5(oldPassword)) {
      return res
        .status(400)
        .json({ code: 400, message: "Mật khẩu cũ không chính xác" });
    }
    if (user.password === md5(newPassword)) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu mới không được giống mật khẩu cũ",
      });
    }
    
    user.password = md5(newPassword);
    await user.save();
    res.status(200).json({ code: 200, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }
    
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    
    const otpRandom = generateHelper.generateRandomNumber();
    const otpObject = {
      email: email,
      otp: otpRandom,
      type: "forgot",
      expiresAt: Date.now(),
    };
    const otp = new Otp(otpObject);
    await otp.save();
    
    const subject = "IT JOB - Mã OTP xác minh tài khoản";
    sendMailHelper.sendMail(email, subject, otpRandom);
    res.json({ code: 200, message: "OTP đã được gửi qua gmail của bạn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpCheck = await Otp.findOne({
      email: email,
      otp: otp,
      type: "forgot",
    });
    if (!otpCheck) {
      return res.status(400).json({ message: "Sai otp" });
    }
    
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    
    const tokenReset = generateHelper.generateToken();
    const objectResetToken = {
      email: email,
      expiresAt: Date.now(),
      resetToken: tokenReset,
    };
    const resetToken = new ResetToken(objectResetToken);
    await resetToken.save();
    await Otp.findOneAndDelete({ email: email });
    
    res.status(200).json({
      code: 200,
      message: "Xác minh thành công, vui lòng đổi mật khẩu",
      resetToken: resetToken.resetToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const resetTokenCheck = await ResetToken.findOne({
      email: email,
      resetToken: resetToken,
    });
    if (!resetTokenCheck) {
      return res.status(400).json({
        message: "Dữ liệu check reset password lỗi, vui lòng làm lại từ đầu",
      });
    }
    
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }
    if (user.password === md5(newPassword)) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới không được giống mật khẩu cũ" });
    }
    
    user.password = md5(newPassword);
    await user.save();
    await ResetToken.findOneAndDelete({ email: email });
    
    res.cookie("userToken", user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      code: 200,
      message: "Đổi mật khẩu thành công và đăng nhập thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[GET] /api/v1/users/my-cvs
module.exports.getMyCvs = async (req, res) => {
  try {
    const cvs = await UserCv.find({ 
      idUser: req.user._id, 
      deleted: false 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[POST] /api/v1/users/my-cvs/create
module.exports.createMyCv = async (req, res) => {
  try {
    req.body.idUser = req.user._id;
    const cv = await UserCv.create(req.body);
    res.status(200).json({ code: 200, message: "Tạo CV thành công", cv: cv });
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[PATCH] /api/v1/users/my-cvs/edit/:id
module.exports.editMyCv = async (req, res) => {
  try {
    const cv = await UserCv.findOne({
      _id: req.params.id,
      idUser: req.user._id,
      deleted: false,
    });
    
    if (!cv) {
      return res.status(404).json({ message: "Không tìm thấy CV" });
    }
    
    const updatedCv = await UserCv.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.status(200).json({ 
      code: 200, 
      message: "Cập nhật CV thành công", 
      cv: updatedCv 
    });
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[DELETE] /api/v1/users/my-cvs/delete/:id
module.exports.deleteMyCv = async (req, res) => {
  try {
    const cv = await UserCv.findOne({
      _id: req.params.id,
      idUser: req.user._id,
      deleted: false,
    });
    
    if (!cv) {
      return res.status(404).json({ message: "Không tìm thấy CV" });
    }
    
    await UserCv.findByIdAndUpdate(req.params.id, {
      deleted: true,
      deletedAt: new Date(),
    });
    
    res.status(200).json({ code: 200, message: "Xóa CV thành công" });
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[GET] /api/v1/users/sent-cvs
module.exports.getSentCvs = async (req, res) => {
  try {
    const cvs = await Cv.find({ 
      idUser: req.user._id, 
      deleted: false 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[DELETE] /api/v1/users/sent-cvs/withdraw/:id
module.exports.withdrawCv = async (req, res) => {
  try {
    const cv = await Cv.findOne({
      _id: req.params.id,
      idUser: req.user._id,
      deleted: false,
    });
    
    if (!cv) {
      return res.status(404).json({ message: "Không tìm thấy CV đã gửi" });
    }
    
    // Chỉ cho phép thu hồi CV nếu chưa được đọc
    if (cv.status !== 'unread') {
      return res.status(400).json({ 
        message: "Không thể thu hồi CV đã được xem hoặc phản hồi" 
      });
    }
    
    await Cv.findByIdAndUpdate(req.params.id, {
      deleted: true,
      deletedAt: new Date(),
    });
    
    res.status(200).json({ code: 200, message: "Thu hồi CV thành công" });
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};
