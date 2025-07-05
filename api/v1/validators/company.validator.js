

//  Hàm kiểm tra độ mạnh của mật khẩu
const isStrongPassword = (password) => {
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const upperCaseRegex = /[A-Z]/;
  const lowerCaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;

  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }

  if (password.length > 20) {
    return "Mật khẩu không được vượt quá 20 ký tự";
  }

  if (/\s/.test(password)) {
    return "Mật khẩu không được chứa ký tự trống (space)";
  }

  if (!upperCaseRegex.test(password)) {
    return "Mật khẩu phải chứa ít nhất một chữ cái viết hoa";
  }

  if (!lowerCaseRegex.test(password)) {
    return "Mật khẩu phải chứa ít nhất một chữ cái viết thường";
  }

  if (!numberRegex.test(password)) {
    return "Mật khẩu phải chứa ít nhất một số";
  }

  if (!specialCharRegex.test(password[password.length - 1])) {
    return "Ký tự cuối của mật khẩu phải là ký tự đặc biệt";
  }

  if (password[0] !== password[0].toUpperCase()) {
    return "Ký tự đầu tiên của mật khẩu phải viết hoa";
  }

  return null; // hợp lệ
};

//  Hàm kiểm tra độ dài chuỗi
const checkLength = (field, value, min, max) => {
  if (!value) return null;

  if (value.length < min) {
    return `${field} phải có ít nhất ${min} ký tự`;
  }

  if (value.length > max) {
    return `${field} không được vượt quá ${max} ký tự`;
  }

  return null;
};

//  kiểm tra đăng nhập
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

  const error = isStrongPassword(password);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

//  kiểm tra đăng ký
const checkRegister = (req, res, next) => {
  const { email, password, phone, companyName } = req.body;

  if (!email) {
    return res.status(400).json({ code: 400, message: "Vui lòng nhập email" });
  }
  if (!phone) {
    return res.status(400).json({ code: 400, message: "Vui lòng nhập số điện thoại" });
  }
  if (!companyName) {
    return res.status(400).json({ code: 400, message: "Vui lòng nhập tên công ty" });
  }

  const emailLengthError = checkLength("Email", email, 5, 100);
  const phoneLengthError = checkLength("Số điện thoại", phone, 9, 11);
  const nameLengthError = checkLength("Tên công ty", companyName, 2, 100);

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
    return res.status(400).json({ code: 400, message: "Số điện thoại không hợp lệ" });
  }

  const error = isStrongPassword(password);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

//  kiểm tra email quên mật khẩu
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

//  kiểm tra reset mật khẩu
const checkResetPassword = (req, res, next) => {
  try {
    const newPassword = req.body.newPassword;

    if (!newPassword) {
      return res.status(400).json({ code: 400, message: "Chưa nhập mật khẩu mới" });
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

//  kiểm tra đổi mật khẩu
const checkChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword) {
    return res.status(400).json({ code: 400, message: "Chưa nhập mật khẩu cũ" });
  }

  if (!newPassword) {
    return res.status(400).json({ code: 400, message: "Chưa nhập mật khẩu mới" });
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

//  kiểm tra chỉnh sửa công ty
const checkEditCompany = (req, res, next) => {
  const { companyName, phone, email, address, description } = req.body;

  if (email !== req.company.email) {
    return res.status(400).json({ code: 400, message: "Không được thay đổi email" });
  }

  if (!companyName || !phone || !address || !description) {
    return res.status(400).json({ code: 400, message: "Chưa nhập đủ thông tin yêu cầu" });
  }

  const validations = [
    checkLength("Tên công ty", companyName, 2, 100),
    checkLength("Số điện thoại", phone, 9, 11),
    checkLength("Địa chỉ", address, 5, 200),
    checkLength("Mô tả", description, 10, 1000),
  ];

  const error = validations.find((msg) => msg !== null);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

//  Export tất cả middleware
module.exports = {
  checkLogin,
  checkRegister,
  checkLength,
  checkEmailResetPassword,
  checkResetPassword,
  checkChangePassword,
  checkEditCompany,
};
