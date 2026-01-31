/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TGenericErrorResponse } from "../interfaces/error.types.js";

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const matchedArray = error.message.match(/"([^"]*)"/);
  return {
    statusCode: 400,
    message: `${matchedArray[1]} already exists!`,
  };
};

export default handleDuplicateError;
