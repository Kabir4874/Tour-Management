/* eslint-disable @typescript-eslint/no-unused-vars */
import type mongoose from "mongoose";
import type { TGenericErrorResponse } from "../interfaces/error.types.js";

const handleCastError = (
  error: mongoose.Error.CastError,
): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid MongoDB ObjectID. Please provide a valid ID",
  };
};

export default handleCastError;
