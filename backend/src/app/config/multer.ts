import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: (req, file) => {
    const originalNameWithoutExtension = file.originalname.replace(
      /\.[^/.]+$/,
      "",
    );

    const fileName = originalNameWithoutExtension
      .toLocaleLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "-")
      .replace(/[^a-z0-9.-]/g, "");

    const uniqueFileName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      fileName;

    return {
      folder: "tour-management",
      public_id: uniqueFileName,
    };
  },
});

export const multerUpload = multer({ storage });
