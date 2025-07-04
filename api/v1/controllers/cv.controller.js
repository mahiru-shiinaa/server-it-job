const Cv = require("../models/cv.model");

//[POST] /api/v1/cv/create
module.exports.create = async (req, res) => {
    try {
        const cv = await Cv.findOne({ email: req.body.email, idJob: req.body.idJob, deleted: false });
        if(!cv) {
            const newCv = await Cv.create(req.body);
            res.status(200).json(newCv);
        } else {
            res.status(400).json({ code: 400, message: "Bạn đã gửi CV Job này" });
        }
    } catch (error) {
        res.status(500).json(error);
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
        const cv = await Cv.findOne({ _id: req.params.id, idCompany: req.company._id, deleted: false });
        if(cv) {
            await Cv.updateOne({ $and: [{ _id: req.params.id }, { idCompany: req.company._id }] }, { deleted: true, deletedAt: new Date() });
        }
        res.status(200).json({ code: 200, message: "Đã Xoá CV" });
    } catch (error) {
        res.status(500).json("Lỗi server");
    }
};

//[GET] /api/v1/cv/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const cv = await Cv.findOne({ _id: req.params.id, idCompany: req.company._id, deleted: false });
        res.status(200).json(cv);
    } catch (error) {
        res.status(500).json(error);
    }
};

//[PATCH] /api/v1/cv/change-status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const cv = await Cv.findByIdAndUpdate({ _id: req.params.id, idCompany: req.company._id, deleted: false }, { statusRead: true }, { new: true });
        res.status(200).json({ code: 200, message: "Cập nhập đã đọc", cv: cv });
    } catch (error) {
        res.status(500).json("Lỗi server");
    }
};