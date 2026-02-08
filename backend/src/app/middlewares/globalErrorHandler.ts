/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Request, Response } from "express";
import { cloudinaryUpload } from "../config/cloudinary.js";
import envVars from "../config/env.js";
import AppError from "../errorHelpers/AppError.js";
import handleCastError from "../helpers/handleCastError.js";
import handleDuplicateError from "../helpers/handleDuplicateError.js";
import handleValidationError from "../helpers/handleValidationError.js";
import handleZodError from "../helpers/handleZodError.js";
import type { TErrorSources } from "../interfaces/error.types.js";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = `Something went wrong!`;
  let errorSources: TErrorSources[] = [];

  if (envVars.NODE_ENV === "development") {
    console.log(error);
  }

  if (error.code === 11000) {
    const simplifiedError = handleDuplicateError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (error.name === "CastError") {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (error.name === "ZodError") {
    const simplifiedError = handleZodError(error);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  } else if (error.name === "ValidationError") {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources as TErrorSources[];
    message = simplifiedError.message;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const requestWithFiles = req as Request & {
    file?: { filename?: string };
    files?: { filename?: string }[] | Record<string, { filename?: string }[]>;
  };

  const uploadedFileNames = new Set<string>();

  if (requestWithFiles.file?.filename) {
    uploadedFileNames.add(requestWithFiles.file.filename);
  }

  if (Array.isArray(requestWithFiles.files)) {
    requestWithFiles.files.forEach((file) => {
      if (file?.filename) {
        uploadedFileNames.add(file.filename);
      }
    });
  } else if (requestWithFiles.files && typeof requestWithFiles.files === "object") {
    Object.values(requestWithFiles.files).forEach((fileList) => {
      fileList.forEach((file) => {
        if (file?.filename) {
          uploadedFileNames.add(file.filename);
        }
      });
    });
  }

  const sendErrorResponse = () => {
    res.status(statusCode).json({
      success: false,
      message,
      errorSources,
      error: envVars.NODE_ENV === "development" ? error : null,
      stack: envVars.NODE_ENV === "development" ? error.stack : null,
    });
  };

  if (uploadedFileNames.size === 0) {
    sendErrorResponse();
    return;
  }

  Promise.allSettled(
    Array.from(uploadedFileNames).map((fileName) =>
      cloudinaryUpload.uploader.destroy(fileName),
    ),
  )
    .then((results) => {
      if (envVars.NODE_ENV === "development") {
        results.forEach((result) => {
          if (result.status === "rejected") {
            console.log("Cloudinary cleanup failed:", result.reason);
          }
        });
      }
    })
    .finally(() => {
      sendErrorResponse();
    });
};
