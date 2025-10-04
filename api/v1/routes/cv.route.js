const express = require("express");
const router = express.Router();
const cvController = require("../controllers/cv.controller");
const authMiddlewares = require("../middlewares/auth.middleware");
const userAuthMiddleware = require("../middlewares/user-auth.middleware");
const optionalAuthMiddleware = require("../middlewares/optional-auth.middleware");
const cvValidator = require("../validators/cv.validator");

// Public routes - có thể là user đã đăng ký hoặc khách vãng lai
router.post("/create", optionalAuthMiddleware.optionalAuth, cvValidator.checkCreateCV, cvController.create);

// Company routes  
router.get("/", authMiddlewares.requireAuth, cvController.index); 
router.delete("/delete/:id", authMiddlewares.requireAuth, cvController.delete);
router.get("/detail/:id", authMiddlewares.requireAuth, cvController.detail);
router.patch("/change-status/:id", authMiddlewares.requireAuth, cvController.changeStatus);
router.post("/reply/:id", authMiddlewares.requireAuth, cvController.reply);

// User routes - để lấy danh sách CV cho dropdown
router.get("/my-cv-list", userAuthMiddleware.requireAuth, cvController.getMyCvList);

module.exports = router;