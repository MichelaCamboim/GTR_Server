import cloudinary from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import * as dotenv from "dotenv";

dotenv.config();

const cloudinaryInst = cloudinary.v2;

cloudinaryInst.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryInst,
  params: {
    allowed_formats: ["jpg", "png", "pdf", "epub"],
    folder: "GTR-Ironhack",
    resource_type: "raw",
    use_filename: true,
    async: true,
  },
});

const fileUpload = multer({ storage: storage });

export default fileUpload;
