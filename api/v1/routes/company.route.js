const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authMiddlewares = require("../middlewares/auth.middleware");
const companyValidator = require("../validators/company.validator");


// middlewares/otpLimiter.js
const rateLimit = require("express-rate-limit");
//set thời gian giãn cách gửi request
const otpLimiterByEmail = rateLimit({
  windowMs: 60 * 1000, // 60 giây
  max: 1,              // Tối đa 1 request trong 60 giây
  keyGenerator: (req) => req.body.email || req.ip, // Ưu tiên giới hạn theo email
  message: {
    code: 429,
    message: "Bạn chỉ được yêu cầu OTP mỗi 60 giây.",
  },
  skipFailedRequests: true, // Không tính những request bị lỗi trước đó (VD: nhập sai định dạng)
});



router.get("/", companyController.index); 
router.get("/info/:id", companyController.info); 

router.post("/auth/login", companyValidator.checkLogin, companyController.login);
router.post("/auth/register", companyValidator.checkRegister, companyController.register);
router.post("/auth/register/checkEmailOtp", companyController.checkEmailOtp);
router.post("/auth/register/resendCheckEmailOtp", otpLimiterByEmail, companyController.resendCheckEmailOtp);
router.post("/auth/logout", companyController.logout);
router.post("/auth/register/cancel-register", companyController.cancelRegister);

router.get("/me", authMiddlewares.requireAuth, companyController.detail);
router.patch("/me/edit", authMiddlewares.requireAuth, companyValidator.checkEditCompany, companyController.edit);
router.patch("/me/change-password", authMiddlewares.requireAuth, companyValidator.checkChangePassword, companyController.changePassword);

router.post("/password/forgot", companyValidator.checkEmailResetPassword, otpLimiterByEmail, companyController.forgotPassword);
router.post("/password/otp", companyController.otpPassword);
router.post("/password/resendOtp", companyValidator.checkEmailResetPassword, otpLimiterByEmail, companyController.resendOtp);
router.post("/password/reset", companyValidator.checkResetPassword, companyController.resetPassword);

module.exports = router;