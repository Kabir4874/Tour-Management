import { v2 as cloudinary } from "cloudinary";
import envVars from "./env.js";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key: envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET,
});

export const cloudinaryUpload = cloudinary;

export const extractPublicIdFromCloudinaryUrl = (url: string) => {
  const match = url.match(/\/upload\/(?:.*\/)?v\d+\/(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  return match?.[1] ?? null;
};
