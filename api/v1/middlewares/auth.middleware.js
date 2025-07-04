const Company = require("../models/company.model");
module.exports.requireAuth = async (req, res, next) => {
    try {
            const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({Code: 400, message: "Dữ liệu lỗi, vui lòng đăng nhập lại"});
    }
    const company = await Company.findOne({token: token, deleted: false}).select("-password -token");
    if (!company) {
        return res.status(401).json({Code: 400, message: "Tài khoản không tồn tại"});
    }
    req.company = company;
    next();
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
        
    }
}

