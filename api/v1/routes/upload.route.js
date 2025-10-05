// api/v1/routes/upload.route.js
const { Router } = require("express");
const multer = require("multer");
const router = Router();
const upload = multer();
const uploadCloud = require("../../../middlewares/uploadCloud.middlewares");
const uploadController = require("../controllers/upload.controller");

router.post(
  "/",
  upload.single("file"),
  uploadCloud.uploadSingle,
  uploadController.index
);

router.post("/image", upload.single("file"), uploadController.uploadImage);

// Route upload CV - chỉ chấp nhận PDF dưới 10MB
router.post("/cv", upload.single("file"), uploadController.uploadCV);

module.exports = router;