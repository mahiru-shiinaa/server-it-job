const City = require("../models/city.model");
//[GET] /api/v1/city
module.exports.index = async (req, res) => {
    try {
        const citys = await City.find({});
        res.status(200).json(citys);
    } catch (error) {
        res.status(500).json(error);   
    }
}