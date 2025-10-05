const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const userAuthMiddleware = require("../middlewares/user-auth.middleware");
const userValidator = require("../validators/user.validator");

// Rate limiter for OTP requests
const rateLimit = require("express-rate-limit");
const otpLimiterByEmail = rateLimit({
  windowMs: 60 * 1000, // 60 giây
  max: 1,              // Tối đa 1 request trong 60 giây
  keyGenerator: (req) => req.body.email || req.ip,
  message: {
    code: 429,
    message: "Bạn chỉ được yêu cầu OTP mới 60 giây.",
  },
  skipFailedRequests: true,
});

// Authentication routes
router.post("/auth/register", userValidator.checkRegister, userController.register);
router.post("/auth/register/checkEmailOtp", userController.checkEmailOtp);
router.post("/auth/register/resendCheckEmailOtp", otpLimiterByEmail, userController.resendCheckEmailOtp);
router.post("/auth/login", userValidator.checkLogin, userController.login);
router.post("/auth/logout", userController.logout);
router.post("/auth/register/cancel-register", userController.cancelRegister);

// Profile management routes
router.get("/me", userAuthMiddleware.requireAuth, userController.detail);
router.patch("/me/edit", userAuthMiddleware.requireAuth, userValidator.checkEditUser, userController.edit);
router.delete("/me/delete", userAuthMiddleware.requireAuth, userController.delete);
router.patch("/me/change-password", userAuthMiddleware.requireAuth, userValidator.checkChangePassword, userController.changePassword);

// Password reset routes
router.post("/password/forgot", userValidator.checkEmailResetPassword, otpLimiterByEmail, userController.forgotPassword);
router.post("/password/otp", userController.otpPassword);
router.post("/password/resendOtp", userValidator.checkEmailResetPassword, otpLimiterByEmail, userController.resendOtp);
router.post("/password/reset", userValidator.checkResetPassword, userController.resetPassword);

// My CVs management routes
router.get("/my-cvs", userAuthMiddleware.requireAuth, userController.getMyCvs);
router.post("/my-cvs/create", userAuthMiddleware.requireAuth, userValidator.checkMyCv, userController.createMyCv);
router.patch("/my-cvs/edit/:id", userAuthMiddleware.requireAuth, userValidator.checkMyCv, userController.editMyCv);
router.get("/my-cvs/detail/:id", userAuthMiddleware.requireAuth, userController.getMyCvDetail);
router.delete("/my-cvs/delete/:id", userAuthMiddleware.requireAuth, userController.deleteMyCv);

// Sent CVs management routes
router.get("/sent-cvs", userAuthMiddleware.requireAuth, userController.getSentCvs);
router.get("/sent-cvs/detail/:id", userAuthMiddleware.requireAuth, userController.getSentCvDetail);
router.delete("/sent-cvs/withdraw/:id", userAuthMiddleware.requireAuth, userController.withdrawCv);

module.exports = router;