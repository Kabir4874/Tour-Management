import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import AppError from "../errorHelpers/AppError.js";
import envVars from "./env.js";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key: envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET,
});

export const cloudinaryUpload = cloudinary;

export const extractPublicIdFromCloudinaryUrl = (url: string) => {
  const match = url.match(
    /\/upload\/(?:.*\/)?v\d+\/(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/,
  );
  return match?.[1] ?? null;
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  filename: string,
) => {
  const publicId = `${filename}-${Date.now()}`;

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "tour-management/pdf",
          public_id: publicId,
        },
        (error, uploadResult) => {
          if (error) {
            return reject(error);
          }

          if (!uploadResult) {
            return reject(
              new Error("Cloudinary upload failed: empty response"),
            );
          }

          resolve(uploadResult);
        },
      );

      uploadStream.end(buffer);
    });

    return result;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown upload error";
    throw new AppError(500, `Error uploading file: ${message}`);
  }
};
