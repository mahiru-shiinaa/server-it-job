module.exports.checkCreateCV = (req, res, next) => {
  try {
    const { name, phone, email, city, description, linkProject } = req.body;
    
    if (!name || !phone || !email || !city || !description || !linkProject) {
      return res
        .status(400)
        .json({ code: 400, message: `Chưa nhập đủ thông tin cần thiết`  });
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
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
