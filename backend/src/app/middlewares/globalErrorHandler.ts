/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Request, Response } from "express";
import envVars from "../config/env.js";
import AppError from "../errorHelpers/AppError.js";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = `Something went wrong!`;
  const errorSources: any = [];

  if (error.code === 11000) {
    const matchedArray = error.message.match(/"([^"]*)"/);
    statusCode = 400;
    message = `${matchedArray[1]} already exists!`;
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid MongoDB ObjectID. Please provide a valid ID";
  } else if (error.name === "ZodError") {
    statusCode = 400;
    message = "Zod Error";
    error.issues.forEach((issue: any) => {
      errorSources.push({
        path: issue.path[issue.path.length - 1],
        message: issue.message,
      });
    });
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(error.errors);
    errors.forEach((errorObject: any) =>
      errorSources.push({
        path: errorObject.path,
        message: errorObject.message,
      }),
    );
    message = "Validation Error";
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    error,
    stack: envVars.NODE_ENV === "development" ? error.stack : null,
  });
};
