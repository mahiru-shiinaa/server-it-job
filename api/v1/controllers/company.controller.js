const Company = require("../models/company.model");
const Otp = require("../models/otp.model");
const ResetToken = require("../models/reset-token.model");
const Job = require("../models/job.model");
const CV = require("../models/cv.model");
const md5 = require("md5");
const sendMailHelper = require("../../../helpers/sendMail");
const generateHelper = require("../../../helpers/generate");

//[GET] /api/v1/companys
module.exports.index = async (req, res) => {
  try {
    const companys = await Company.find({ deleted: false }).select(
      " -password -token"
    );
    res.status(200).json(companys);
  } catch (error) {
    res.status(500).json(error);
  }
};

//[GET] /api/v1/companys/info/:id
module.exports.info = async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      deleted: false,
    }).select("-password -token");
    res.json(company);
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[POST] /api/v1/companys/auth/login
module.exports.login = async (req, res) => {
  try {
    const company = await Company.findOne({
      email: req.body.email,
      deleted: false,
    });
    if (!company) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    if (company.password !== md5(req.body.password)) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }
    const token = company.token;
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // production thì secure: true
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ code: 200, message: "Login thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[GET] /api/v1/company/auth/logout
module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ code: 200, message: "Logout thành công" });
  } catch (error) {
    res.status(500).json(error);
  }
};

//[POST] /api/v1/companys/auth/register
module.exports.register = async (req, res) => {
  try {
    //1. Lấy thông tin người dùng
    const { phone, email, password } = req.body;
    //2. Kiểm tra tồn tại
    const checkCompany = await Company.findOne({
      $or: [{ phone }, { email }],
    });
    // Báo lỗi đã tồn tại
    if (checkCompany?.email === email) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }
    if (checkCompany?.phone === phone) {
      return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
    }

    //3. Tạo người dùng nhưng chưa duyệt
    req.body.password = md5(password);
    req.body.deleted = true;
    const company = new Company(req.body);
    await company.save();
    //4. Tạo otp và gửi mail;
    const otpRandom = generateHelper.generateRandomNumber();
    const otbObject = {
      email: email,
      otp: otpRandom,
      type: "register",
      expiresAt: Date.now(),
    };
    const otp = new Otp(otbObject);
    await otp.save();
    const subject = "IT JOB - Mã OTP xác minh tài khoản";
    sendMailHelper.sendMail(email, subject, otpRandom);
    res.json({
      code: 200,
      message: "Đăng ký thành công, vui lòng xác minh tài khoản",
      email: email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/companys/auth/register/checkEmailOtp
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
    const company = await Company.findOne({ email: email });
    if (!company) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    const token = generateHelper.generateToken();
    company.token = token;
    company.deleted = false;
    await company.save();
    await Otp.findOneAndDelete({ email: email });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // production thì secure: true
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ code: 200, message: "Xác minh thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/companys/auth/register/cancelRegister
module.exports.cancelRegister = async (req, res) => {
  try {
    const { email } = req.body;
    const company = await Company.findOne({ email: email, deleted: true });
    if (!company) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }
    await Company.findOneAndDelete({ email: email, deleted: true });
    await Otp.findOneAndDelete({ email: email });
    res.status(200).json({ code: 200, message: "Hủy đăng ký thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] /api/v1/companys/auth/register/resendCheckEmailOtp
module.exports.resendCheckEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const company = await Company.findOne({ email: email });
    if (!company) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    if (company.deleted === false) {
      return res
        .status(400)
        .json({ message: "Tài khoản này đã được xác minh" });
    }
    const otp = generateHelper.generateRandomNumber();
    await Otp.findOneAndDelete({ email: email, type: "register" });

    const otbObject = {
      email: email,
      otp: otp,
      type: "register",
      expiresAt: Date.now(),
    };
    const otpCheck = new Otp(otbObject);
    await otpCheck.save();
    const subject = "IT JOB - Mã OTP xác minh tài khoản";
    sendMailHelper.sendMail(email, subject, otp);
    return res.status(200).json({ code: 200, message: "Mã OTP mới được gửi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[GET] /api/v1/companys/me
module.exports.detail = async (req, res) => {
  try {
    res.json({
      code: 200,
      message: "Thành công",
      company: req.company,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

//[PATCH] /api/v1/companys/me/edit
module.exports.edit = async (req, res) => {
  try {
    if (req.body.quantityPeople) {
      const people = Number(req.body.quantityPeople);

      // Nếu không phải số hoặc là NaN
      if (!Number.isFinite(people)) {
        return res.status(400).json({ message: "Số lượng nhân sự phải là số" });
      }

      if (people <= 0) {
        return res
          .status(400)
          .json({ message: "Số lượng nhân sự phải lớn hơn 0" });
      }
    }

    const company = await Company.findOneAndUpdate(
      { _id: req.company._id },
      req.body,
      { new: true }
    );
    res.json({ code: 200, message: "Cập nhật thành công", company: company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[DELETE] /api/v1/companys/me/delete
module.exports.delete = async (req, res) => {
  try {
    // Xóa tất cả CV thuộc về công ty
    await CV.deleteMany({ idCompany: req.company._id });

    // Xóa tất cả Job thuộc về công ty
    await Job.deleteMany({ idCompany: req.company._id });

    // Cuối cùng xóa công ty
    await Company.findByIdAndDelete(req.company._id);

     res.clearCookie("token", {
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

//[POST] api/v1/companys/me/change-password
module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const company = await Company.findOne({ _id: req.company._id });
    if (company.password !== md5(oldPassword)) {
      return res
        .status(400)
        .json({ code: 400, message: "Mật khẩu cũ không chính xác" });
    }
    if (company.password === md5(newPassword)) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu mới không được giống mật khẩu cũ",
      });
    }
    company.password = md5(newPassword);
    await company.save();
    res.status(200).json({ code: 200, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] api/v1/companys/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email" });
  }
  const user = await Company.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ message: "Tài khoản không tồn tại" });
  }
  const otpRandom = generateHelper.generateRandomNumber();
  const otbObject = {
    email: email,
    otp: otpRandom,
    type: "forgot",
    expiresAt: Date.now(),
  };
  const otp = new Otp(otbObject);
  await otp.save();
  const subject = "IT JOB - Mã OTP xác minh tài khoản";
  sendMailHelper.sendMail(email, subject, otpRandom);
  res.json({ code: 200, message: "OTP đã được gửi qua gmail của bạn" });
};

//[POST] api/v1/companys/password/otp
module.exports.otpPassword = async (req, res) => {
  const { email, otp } = req.body;
  const otpCheck = await Otp.findOne({
    email: email,
    otp: otp,
    type: "forgot",
  });
  if (!otpCheck) {
    return res.status(400).json({ message: "Sai otp" });
  }
  const company = await Company.findOne({ email: email });
  if (!company) {
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
  await Otp.findOneAndDelete({ email: email }); // Đúng cú pháp
  res.status(200).json({
    code: 200,
    message: "Xác minh thành công, vui lòng đổi mật khẩu",
    resetToken: resetToken.resetToken,
  });
};

//[POST] api/v1/companys/password/resendOtp
module.exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const company = await Company.findOne({ email: email, deleted: false });
    if (!company) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }
    const otp = generateHelper.generateRandomNumber();
    await Otp.findOneAndDelete({ email: email, type: "forgot" });

    const otbObject = {
      email: email,
      otp: otp,
      type: "forgot",
      expiresAt: Date.now(),
    };
    const otpCheck = new Otp(otbObject);
    await otpCheck.save();
    const subject = "IT JOB - Mã OTP xác minh tài khoản";
    sendMailHelper.sendMail(email, subject, otp);
    return res.status(200).json({ code: 200, message: "Mã OTP mới được gửi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[POST] api/v1/companys/password/reset
module.exports.resetPassword = async (req, res) => {
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
  const company = await Company.findOne({ email: email });
  if (!company) {
    return res.status(400).json({ message: "Email không tồn tại" });
  }
  if (company.password === md5(newPassword)) {
    return res
      .status(400)
      .json({ message: "Mật khẩu mới không được giống mật khẩu cũ" });
  }
  company.password = md5(newPassword);
  await company.save();
  await ResetToken.findOneAndDelete({ email: email });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // production thì secure: true
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    code: 200,
    message: "Đổi mật khẩu thành công và đăng nhập thành công",
  });
};
