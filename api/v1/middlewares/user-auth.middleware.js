const User = require("../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.userToken;
        if(!token) {
            return res.status(401).json({code: 400, message: "Dữ liệu lỗi, vui lòng đăng nhập lại"});
        }
        
        const user = await User.findOne({token: token, deleted: false}).select("-password -token");
        if (!user) {
            return res.status(401).json({code: 400, message: "Tài khoản không tồn tại"});
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi server"});
    }
}