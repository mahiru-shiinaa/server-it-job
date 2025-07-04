// validators/password.validator.js

// Hàm kiểm tra độ mạnh của mật khẩu
const isStrongPassword = (password) => {
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const upperCaseRegex = /[A-Z]/;
  const lowerCaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;

  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }

  if (password.length > 12) {
    return "Mật khẩu không được vượt quá 12 ký tự";
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


// Middleware: kiểm tra đăng nhập
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

  const error = isStrongPassword(password);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

// Middleware: kiểm tra đăng ký
const checkRegister = (req, res, next) => {
  const { email, password, phone, companyName } = req.body;

  if (!email || !password || !phone || !companyName) {
    return res
      .status(400)
      .json({
        code: 400,
        message:
          "Chưa nhập đủ thông tin (email, mật khẩu, số điện thoại, tên công ty)",
      });
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
}

// Middleware: kiểm tra reset mật khẩu
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

// Middleware: kiểm tra đổi mật khẩu
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
    return res
      .status(400)
      .json({
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

const checkEditCompany = (req, res, next) => {
  const { companyName, phone, email, address, description  } = req.body;
  if(email !== req.company.email) {
    return res
      .status(400)
      .json({ code: 400, message: "Không được thay đổi email" });
  }
  if (!companyName || !phone  || !address || !description) {
    return res
      .status(400)
      .json({ code: 400, message: "Chưa nhập đủ thông tin yêu cầu" });
  }

  next();
}

// Export
module.exports = {
  checkLogin,
  checkRegister,
  checkEmailResetPassword,
  checkResetPassword,
  checkChangePassword,
  checkEditCompany
};
