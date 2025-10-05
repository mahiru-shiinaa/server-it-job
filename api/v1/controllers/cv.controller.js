const Cv = require("../models/cv.model");

const sendMailReplyHelper = require("../../../helpers/SendMailReplyCv");
//[POST] /api/v1/cv/create
module.exports.create = async (req, res) => {
  try {
    const { selectedCvId, linkCV } = req.body;

    // Kiểm tra đã gửi CV cho job này chưa
    const existingCv = await Cv.findOne({
      email: req.body.email,
      phone: req.body.phone,
      idJob: req.body.idJob,
      deleted: false,
    });

    if (existingCv) {
      return res.status(400).json({
        code: 400,
        message: "Bạn đã gửi CV cho Job này",
      });
    }

    // Xử lý CV dựa trên loại user
    if (selectedCvId) {
      // User đã đăng ký - chọn CV từ kho
      const UserCv = require("../models/user-cv.model");
      const selectedCV = await UserCv.findOne({
        _id: selectedCvId,
        idUser: req.body.idUser,
        deleted: false,
      });

      if (!selectedCV) {
        return res.status(400).json({
          code: 400,
          message: "CV không tồn tại hoặc không thuộc về bạn",
        });
      }

      // ✅ Chỉ copy URL, không lưu selectedCvId
      req.body.linkCV = selectedCV.cvUrl;
    } else if (linkCV) {
      // Khách vãng lai - upload CV mới
      req.body.linkCV = linkCV;
      req.body.idUser = null;
    } else {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng chọn CV từ danh sách hoặc upload CV mới",
      });
    }

    const newCv = await Cv.create(req.body);
    res.status(200).json({
      code: 200,
      message: "Gửi CV thành công",
      cv: newCv,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//[GET] /api/v1/cv
module.exports.index = async (req, res) => {
  try {
    const idCompany = req.company._id;
    const cvs = await Cv.find({ idCompany: idCompany, deleted: false });
    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json(error);
  }
};

//[DELETE] /api/v1/cv/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const cv = await Cv.findOne({
      _id: req.params.id,
      idCompany: req.company._id,
      deleted: false,
    });
    if (cv) {
      await Cv.updateOne(
        { $and: [{ _id: req.params.id }, { idCompany: req.company._id }] },
        { deleted: true, deletedAt: new Date() }
      );
    }
    res.status(200).json({ code: 200, message: "Đã Xoá CV" });
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[GET] /api/v1/cv/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const cv = await Cv.findOne({
      _id: req.params.id,
      idCompany: req.company._id,
      deleted: false,
    });
    res.status(200).json(cv);
  } catch (error) {
    res.status(500).json(error);
  }
};

//[PATCH] /api/v1/cv/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const cv = await Cv.findByIdAndUpdate(
      { _id: req.params.id, idCompany: req.company._id, deleted: false },
      { status: "read" }, // Cập nhật từ statusRead thành status với giá trị 'read'
      { new: true }
    );
    res.status(200).json({ code: 200, message: "Cập nhập đã đọc", cv: cv });
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[POST] /api/v1/cv/reply/:id
//[POST] /api/v1/cv/reply/:id
module.exports.reply = async (req, res) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập nội dung phản hồi",
      });
    }

    const cv = await Cv.findOne({
      _id: req.params.id,
      idCompany: req.company._id,
      deleted: false,
    }).populate('idJob', 'name');

    if (!cv) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy CV",
      });
    }

    // Chuẩn bị dữ liệu cho helper
    const cvData = {
      name: cv.name,
      email: cv.email,
    };

    const companyData = {
      companyName: req.company.companyName,
      email: req.company.email,
      phone: req.company.phone,
    };

    const jobName = cv.idJob?.name || "Vị trí không xác định";

    // Gọi helper để gửi email
    await sendMailReplyHelper.sendMailReplyCV(cvData, companyData, jobName, replyMessage);

    // Cập nhật trạng thái CV thành đã phản hồi
    await Cv.findByIdAndUpdate(req.params.id, {
      status: "replied",
    });

    res.status(200).json({
      code: 200,
      message: "Phản hồi đã được gửi thành công",
    });
  } catch (error) {
    console.error("Error in reply CV:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi server khi gửi phản hồi",
    });
  }
};

//[GET] /api/v1/cv/my-cv-list (thêm vào cv.controller.js)
module.exports.getMyCvList = async (req, res) => {
  try {
    const UserCv = require("../models/user-cv.model");
    const cvs = await UserCv.find({
      idUser: req.user._id,
      deleted: false,
    })
      .select("_id cvName createdAt cvUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      code: 200,
      message: "Lấy danh sách CV thành công",
      cvs: cvs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
