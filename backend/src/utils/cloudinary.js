import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      console.log("ok :", localfilePath);
      return null;
    }

    //upload on cloud
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localfilePath);
    return { url: response.url, public_id: response.public_id };
  } catch (err) {
    console.log(" cloud err :", err);
    fs.unlinkSync(localfilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  cloudinary.uploader.destroy(publicId);
};

export { uploadOnCloudinary, deleteFromCloudinary };
