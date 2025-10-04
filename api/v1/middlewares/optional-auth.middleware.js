const User = require("../models/user.model");

// Middleware tùy chọn - không bắt buộc phải đăng nhập
module.exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.userToken;
        
        if (token) {
            const user = await User.findOne({
                token: token, 
                deleted: false
            }).select("-password -token");
            
            if (user) {
                req.user = user;
                req.body.idUser = user._id.toString();
            }
        }
        
        // Nếu không có token hoặc user không tồn tại, vẫn cho phép tiếp tục
        next();
    } catch (error) {
        console.error(error);
        // Nếu có lỗi, vẫn cho phép tiếp tục như khách vãng lai
        next();
    }
}