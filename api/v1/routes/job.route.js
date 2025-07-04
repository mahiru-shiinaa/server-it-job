const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const jobValidator = require("../validators/job.validator");
const authMiddlewares = require("../middlewares/auth.middleware");
// [PUBLIC]
router.get("/", jobController.index); 
router.get("/info/:id", jobController.info); 
router.get("/jobs-to-company/:id", jobController.jobToCompany);

// [PRIVATE]
router.get("/me", authMiddlewares.requireAuth, jobController.jobByCompany);
router.post("/create", authMiddlewares.requireAuth, jobValidator.checkJob, jobController.create);
router.patch("/edit/:id", authMiddlewares.requireAuth, jobValidator.checkJob, jobController.edit);
router.delete("/delete/:id", authMiddlewares.requireAuth, jobController.delete);
module.exports = router;
