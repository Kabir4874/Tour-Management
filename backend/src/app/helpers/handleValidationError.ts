/* eslint-disable @typescript-eslint/no-explicit-any */
import type mongoose from "mongoose";
import type {
  TErrorSources,
  TGenericErrorResponse,
} from "../interfaces/error.types.js";

const handleValidationError = (
  error: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];
  const errors = Object.values(error.errors);
  errors.forEach((errorObject: any) =>
    errorSources.push({
      path: errorObject.path,
      message: errorObject.message,
    }),
  );
  return {
    statusCode: 400,
    message: "Validation Error",
    errorSources,
  };
};

export default handleValidationError;
