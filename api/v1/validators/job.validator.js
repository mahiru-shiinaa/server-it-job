const { checkLength } = require("./company.validator");

const checkJob = (req, res, next) => {
  const { name, tags, salary, city, description } = req.body;

  // Kiểm tra thiếu trường
  if (!name || !tags || !salary || !city || !description) {
    return res.status(400).json({
      code: 400,
      message: "Chưa nhập đủ thông tin",
    });
  }

  // Kiểm tra độ dài nội dung
  const validations = [
    checkLength("Tên công việc", name, 3, 100),
    checkLength("Mức lương", salary, 2, 100),
    checkLength("Mô tả công việc", description, 10, 2000),
  ];

  const error = validations.find((msg) => msg !== null);
  if (error) {
    return res.status(400).json({ code: 400, message: error });
  }

  next();
};

module.exports = { checkJob };
