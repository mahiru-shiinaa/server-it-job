// api/v1/controllers/upload.controller.js
const uploadCloudinary = require("../../../helpers/uploadCloudinary");

const index = async (req, res) => {
  try {
    console.log(req.body);
    res.json({
      location: req.body.file
    });
  } catch (error) {
    console.log('error', error);
  }
}

const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const imageUrl = await uploadCloudinary(file.buffer);

    return res.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
};

// Upload CV - chỉ chấp nhận PDF dưới 10MB
const uploadCV = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ 
        code: 400, 
        message: "Vui lòng chọn file CV" 
      });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ 
        code: 400, 
        message: "Chỉ chấp nhận file PDF" 
      });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ 
        code: 400, 
        message: "Kích thước file không được vượt quá 10MB" 
      });
    }

    // 👇 Thêm tham số "raw" cho file PDF
    const cvUrl = await uploadCloudinary(file.buffer, "raw");

    return res.json({ 
      code: 200,
      message: "Upload CV thành công",
      url: cvUrl 
    });
  } catch (error) {
    console.error("Upload CV error:", error);
    res.status(500).json({ 
      code: 500, 
      message: "Lỗi khi upload CV" 
    });
  }
};

module.exports = {
  index,
  uploadImage,
  uploadCV
};