const Job = require("../models/job.model");

//[GET] /api/v1/jobs
module.exports.index = async (req, res) => {
    try {
        const find = {
            deleted: false, 
            status: true
        }
       const jobs = await Job.find(find);
        
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json(error);
    }
};

//[GET] /api/v1/jobs/info/:id
module.exports.info = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, deleted: false });
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json(error);
    }
};

//[GET] /api/v1/jobs/me
module.exports.jobByCompany = async (req, res) => {
    try {
        const jobs = await Job.find({ idCompany: req.company._id, deleted: false });
        if(jobs.length > 0) {
            res.status(200).json(jobs);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json("Lỗi server");
    }
};

//[POST] /api/v1/jobs/create
module.exports.create = async (req, res) => {
    try {
        req.body.idCompany = req.company._id;
        const job = await Job.create(req.body);
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json(error);
    }
};

//[PATCH] /api/v1/jobs/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const jobCheck = await Job.findOne({ _id: req.params.id, idCompany: req.company._id, deleted: false });
        if(!jobCheck) {
            return res.status(200).json({ code: 404, message: "Không tìm thấy job" });
        }
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ code: 200, message: "Cập nhật thành công", job: job });
    } catch (error) {
        res.status(500).json("Lỗi server");
    }
};

//[DELETE] /api/v1/jobs/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const jobCheck = await Job.findOne({ _id: req.params.id, idCompany: req.company._id, deleted: false });
        if(!jobCheck) {
            return res.status(200).json({ code: 404, message: "Không tìm thấy job" });
        }
        await Job.findByIdAndUpdate(req.params.id, { deleted: true, deletedAt: new Date() });
        res.status(200).json({ code: 200, message: "Xoá job thành công" });
    } catch (error) {
        res.status(500).json("Lỗi server");
    }
};