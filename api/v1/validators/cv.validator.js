const { checkLength } = require("./company.validator");

module.exports.checkCreateCV = (req, res, next) => {
  try {
    const { name, phone, email, city, description, linkProject, selectedCvId, linkCV, idUser } = req.body;

    // Kiểm tra thiếu trường cơ bản
    if (!name || !phone || !email || !city || !description || !linkProject) {
      return res
        .status(400)
        .json({ code: 400, message: "Chưa nhập đủ thông tin cần thiết" });
    }

    // Kiểm tra CV logic
    if (idUser) {
      // User đã đăng ký - phải chọn CV từ dropdown
      if (!selectedCvId) {
        return res.status(400).json({ 
          code: 400, 
          message: "Vui lòng chọn CV từ danh sách của bạn" 
        });
      }
      if (linkCV) {
        return res.status(400).json({ 
          code: 400, 
          message: "User đã đăng ký không thể upload CV trực tiếp" 
        });
      }
    } else {
      // Khách vãng lai - phải upload CV mới
      if (!linkCV) {
        return res.status(400).json({ 
          code: 400, 
          message: "Vui lòng upload CV" 
        });
      }
      if (selectedCvId) {
        return res.status(400).json({ 
          code: 400, 
          message: "Khách vãng lai không thể chọn CV từ danh sách" 
        });
      }
    }

    // Kiểm tra độ dài từng trường
    const validations = [
      checkLength("Họ và tên", name, 2, 100),
      checkLength("Số điện thoại", phone, 9, 11),
      checkLength("Email", email, 5, 100),
      checkLength("Mô tả bản thân", description, 10, 2000),
      checkLength("Link dự án", linkProject, 5, 500),
    ];

    if (linkCV) {
      validations.push(checkLength("Link CV", linkCV, 5, 500));
    }

    const error = validations.find((msg) => msg !== null);
    if (error) {
      return res.status(400).json({ code: 400, message: error });
    }

    // Regex kiểm tra định dạng
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

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};