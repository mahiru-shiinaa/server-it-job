const { isStrongPassword, checkLength } = require("./company.validator");

// Kiểm tra đăng nhập user
const checkLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ code: 400, message: "Chưa nhập email" });
  }

  if (!password) {
    return res.status(400).json({ code: 400, message: "Chưa nhập mật khẩu" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ code: 400, message: "Email không hợp lệ" });
  }

  const emailLengthError = checkLength("Email", email, 5, 100);
  if (emailLengthError) {
    return res.status(400).json({ code: 400, message: emailLengthError });
  }

  if (password.length < 8 || password.length > 20) {
    return res
      .status(400)
      .json({ code: 400, message: "Độ dài mật khẩu không hợp lệ" });
  }

  next();
};

// Kiểm tra đăng ký user
const checkRegister = (req, res, next) => {
  const { email, password, phone, fullName } = req.body;

  if (!email) {
    return res.status(400).json({ code: 400, message: "Vui lòng nhập email" });
  }
  if (!phone) {
    return res
      .status(400)
      .json({ code: 400, message: "Vui lòng nhập số điện thoại" });
  }
  if (!fullName) {
    return res
      .status(400)
      .json({ code: 400, message: "Vui lòng nhập họ và tên" });
  }

  const emailLengthError = checkLength("Email", email, 5, 100);
  const phoneLengthError = checkLength("Số điện thoại", phone, 9, 11);
  const nameLengthError = checkLength("Họ và tên", fullName, 2, 100);

  const lengthError = emailLengthError || phoneLengthError || nameLengthError;
  if (lengthError) {
    return res.status(400).json({ code: 400, message: lengthError });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ code: 400, message: "Email không hợp lệ" });
  }

  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ code: 400, message: "Số điện thoại không hợp lệ" });
  }

  const error = isStrongPassword(password);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

// Kiểm tra email reset password
const checkEmailResetPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ code: 400, message: "Chưa nhập email" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ code: 400, message: "Email không hợp lệ" });
  }

  next();
};

// Kiểm tra reset mật khẩu
const checkResetPassword = (req, res, next) => {
  try {
    const newPassword = req.body.newPassword;

    if (!newPassword) {
      return res
        .status(400)
        .json({ code: 400, message: "Chưa nhập mật khẩu mới" });
    }

    const error = isStrongPassword(newPassword);
    if (error) {
      return res.status(400).json({ code: 400, message: error });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Kiểm tra đổi mật khẩu
const checkChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword) {
    return res
      .status(400)
      .json({ code: 400, message: "Chưa nhập mật khẩu cũ" });
  }

  if (!newPassword) {
    return res
      .status(400)
      .json({ code: 400, message: "Chưa nhập mật khẩu mới" });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      code: 400,
      message: "Mật khẩu mới không được giống mật khẩu cũ",
    });
  }

  const error = isStrongPassword(newPassword);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

// Kiểm tra chỉnh sửa user - UPDATED to include linkProject validation
const checkEditUser = (req, res, next) => {
  const { fullName, phone, email, city, address, description, linkProject, avatar } = req.body;

  if (email !== req.user.email) {
    return res.status(400).json({ code: 400, message: "Không được thay đổi email" });
  }

  if (!fullName || !phone) {
    return res.status(400).json({ code: 400, message: "Chưa nhập đủ thông tin yêu cầu" });
  }

  const validations = [
    checkLength("Họ và tên", fullName, 2, 100),
    checkLength("Số điện thoại", phone, 9, 11),
  ];

  if (city) {
    validations.push(checkLength("Thành phố", city, 1, 100));
  }

  if (address) {
    validations.push(checkLength("Địa chỉ", address, 5, 200));
  }

  if (description) {
    validations.push(checkLength("Mô tả", description, 10, 1000));
  }

  if (linkProject) {
    validations.push(checkLength("Link dự án", linkProject, 5, 500));
  }

  // ✅ NEW: Avatar validation (URL format + length)
  if (avatar) {
    const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i; // kiểm tra định dạng URL
    if (!urlPattern.test(avatar)) {
      return res.status(400).json({ code: 400, message: "Avatar phải là đường dẫn URL hợp lệ" });
    }
    const lengthError = checkLength("Avatar", avatar, 5, 500);
    if (lengthError) {
      return res.status(400).json({ code: 400, message: lengthError });
    }
  }

  const error = validations.find((msg) => msg !== null);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};


// Kiểm tra tạo/sửa CV cá nhân
const checkMyCv = (req, res, next) => {
  const { cvName, cvUrl } = req.body;

  if (!cvName) {
    return res.status(400).json({ code: 400, message: "Chưa nhập tên CV" });
  }

  if (!cvUrl) {
    return res.status(400).json({ code: 400, message: "Chưa có file CV" });
  }

  const cvNameError = checkLength("Tên CV", cvName, 2, 100);
  const cvUrlError = checkLength("URL CV", cvUrl, 5, 500);

  const error = cvNameError || cvUrlError;
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

module.exports = {
  checkLogin,
  checkRegister,
  checkEmailResetPassword,
  checkResetPassword,
  checkChangePassword,
  checkEditUser,
  checkMyCv,
};