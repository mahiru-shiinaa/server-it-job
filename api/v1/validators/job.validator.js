const checkJob = (req, res, next) => {
    const {name, tags, salary, city, description} = req.body;
    if (!name || !tags || !salary || !city || !description) {
        return res.status(400).json({ code: 400, message: "Chưa nhập đủ thông tin" });
    }
    next();
}

module.exports = {checkJob}