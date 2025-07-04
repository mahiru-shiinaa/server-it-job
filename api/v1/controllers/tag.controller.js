const Tag = require("../models/tag.model");
//[GET] /api/v1/tags
module.exports.index = async (req, res) => {
    try {
        const tags = await Tag.find({});
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json("Lỗi server");
        console.log('error', error);
    }
};