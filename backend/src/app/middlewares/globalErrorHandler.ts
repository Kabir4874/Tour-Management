import type { Request, Response } from "express";
import envVars from "../config/env.js";
import AppError from "../errorHelpers/AppError.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = (error: any, req: Request, res: Response) => {
  let statusCode = 500;
  let message = `Something went wrong!`;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error,
    stack: envVars.NODE_ENV === "development" ? error.stack : null,
  });
};
