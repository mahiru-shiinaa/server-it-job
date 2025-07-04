const  express  = require("express");
const router = express.Router();
const cityController = require("../controllers/city.controller");

router.get("/", cityController.index); 

module.exports = router;