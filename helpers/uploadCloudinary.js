const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const streamUpload = (buffer, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: resourceType,
      unique_filename: true, //  tự động tạo tên file unique
      use_filename: false,
    };

    // Thêm folder tùy theo loại file
    if (resourceType === "raw") {
      uploadOptions.folder = "ITJOB_File";
      uploadOptions.format = "pdf";
    } else {
      uploadOptions.folder = process.env.CLOUDINARY_FOLDER || "ITJOB_Images";
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadCloudinary = async (buffer, resourceType = "auto") => {
  const result = await streamUpload(buffer, resourceType);
  return result.secure_url;
};

module.exports = uploadCloudinary;
