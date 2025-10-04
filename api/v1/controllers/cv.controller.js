const Cv = require("../models/cv.model");
const sendMailHelper = require("../../../helpers/sendMail");

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
      return res.status(400).json({ code: 400, message: "Bạn đã gửi CV cho Job này" });
    }

    // Xử lý CV dựa trên loại user
    if (selectedCvId) {
      // User đã đăng ký - chọn CV từ kho
      const UserCv = require("../models/user-cv.model");
      const selectedCV = await UserCv.findOne({
        _id: selectedCvId,
        idUser: req.body.idUser,
        deleted: false
      });
      
      if (!selectedCV) {
        return res.status(400).json({ 
          code: 400, 
          message: "CV không tồn tại hoặc không thuộc về bạn" 
        });
      }
      
      req.body.linkCV = selectedCV.cvUrl;
      req.body.selectedCvId = selectedCvId;
    } else if (linkCV) {
      // Khách vãng lai - upload CV mới
      req.body.linkCV = linkCV;
      req.body.idUser = null;
      req.body.selectedCvId = null;
    } else {
      return res.status(400).json({ 
        code: 400, 
        message: "Vui lòng chọn CV từ danh sách hoặc upload CV mới" 
      });
    }

    const newCv = await Cv.create(req.body);
    res.status(200).json({ 
      code: 200, 
      message: "Gửi CV thành công", 
      cv: newCv 
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
      { status: 'read' }, // Cập nhật từ statusRead thành status với giá trị 'read'
      { new: true }
    );
    res.status(200).json({ code: 200, message: "Cập nhập đã đọc", cv: cv });
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

//[POST] /api/v1/cv/reply/:id
module.exports.reply = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    if (!replyMessage) {
      return res.status(400).json({ 
        code: 400, 
        message: "Vui lòng nhập nội dung phản hồi" 
      });
    }

    const cv = await Cv.findOne({
      _id: req.params.id,
      idCompany: req.company._id,
      deleted: false,
    });

    if (!cv) {
      return res.status(404).json({ 
        code: 404, 
        message: "Không tìm thấy CV" 
      });
    }

    // Cập nhật trạng thái CV thành đã phản hồi
    await Cv.findByIdAndUpdate(req.params.id, { 
      status: 'replied' 
    });

    // Tạo nội dung email phản hồi
    const subject = `IT JOB - Phản hồi từ ${req.company.companyName}`;
    const emailContent = `
      <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 20px;">
          <h1 style="color: #2e5aac; margin-bottom: 5px;">IT JOB</h1>
          <p style="margin: 0; color: #555;">Nền tảng kết nối việc làm ngành CNTT</p>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          <h2 style="color: #333;">Phản hồi từ nhà tuyển dụng</h2>
          <p style="font-size: 16px; color: #555;">Xin chào <strong>${cv.name}</strong>,</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #2e5aac; margin: 20px 0;">
            <p style="margin: 0;"><strong>Công ty:</strong> ${req.company.companyName}</p>
            <p style="margin: 10px 0 0 0;"><strong>Email liên hệ:</strong> ${req.company.email}</p>
            ${req.company.phone ? `<p style="margin: 10px 0 0 0;"><strong>Số điện thoại:</strong> ${req.company.phone}</p>` : ''}
          </div>
          
          <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2e5aac;">Nội dung phản hồi:</h3>
            <p style="line-height: 1.6; color: #333; white-space: pre-line;">${replyMessage}</p>
          </div>
          
          <p style="color: #777; margin-top: 30px;">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ trực tiếp với công ty qua thông tin bên trên.
          </p>
          
          <p style="margin-top: 30px; color: #999;">
            Trân trọng,<br/>
            Đội ngũ <strong>IT JOB</strong>
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 30px;">
          © ${new Date().getFullYear()} IT JOB. All rights reserved.
        </div>
      </div>
    `;

    // Gửi email phản hồi
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: cv.email,
      subject: subject,
      html: emailContent,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending reply email:", error);
        return res.status(500).json({ 
          code: 500, 
          message: "Lỗi khi gửi email phản hồi" 
        });
      } else {
        console.log("Reply email sent: " + info.response);
        res.status(200).json({ 
          code: 200, 
          message: "Phản hồi đã được gửi thành công" 
        });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json("Lỗi server");
  }
};

//[GET] /api/v1/cv/my-cv-list (thêm vào cv.controller.js)
module.exports.getMyCvList = async (req, res) => {
  try {
    const UserCv = require("../models/user-cv.model");
    const cvs = await UserCv.find({ 
      idUser: req.user._id, 
      deleted: false 
    }).select('_id cvName createdAt cvUrl').sort({ createdAt: -1 });
    
    res.status(200).json({
      code: 200,
      message: "Lấy danh sách CV thành công",
      cvs: cvs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};