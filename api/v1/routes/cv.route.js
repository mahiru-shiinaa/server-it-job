const express = require("express");
const router = express.Router();
const cvController = require("../controllers/cv.controller");
const authMiddlewares = require("../middlewares/auth.middleware");
const cvValidator = require("../validators/cv.validator");

router.get("/", authMiddlewares.requireAuth, cvController.index); 
router.post("/create", cvValidator.checkCreateCV, cvController.create); 
router.delete("/delete/:id", authMiddlewares.requireAuth, cvController.delete);
router.get("/detail/:id", authMiddlewares.requireAuth, cvController.detail);
router.patch("/change-status/:id", authMiddlewares.requireAuth, cvController.changeStatus);

module.exports = router;