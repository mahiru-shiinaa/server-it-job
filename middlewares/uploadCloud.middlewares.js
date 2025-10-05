const uploadToCloudinary = require("../helpers/uploadCloudinary");

const uploadSingle = async (req, res, next) => {
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer); // THÊM AWAIT
    req.body[req.file.fieldname] = result;
  }
  next();
};

const uploadFields = async (req, res, next) => {
  const files = req.files;
  console.log('files', files);
  for (const key in files) {
    req.body[key] = [];
    const array = files[key];
    for (const item of array) {
      try {
        const result = await uploadToCloudinary(item.buffer);
        req.body[key].push(result);
      } catch (error) {
        console.error(error);
      }
    }
  }

  next();
};

module.exports = {
  uploadSingle,
  uploadFields
};