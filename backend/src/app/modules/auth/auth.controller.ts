import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { Authservice } from "./auth.service.js";

const credentialsLogin = catchAsync(async (req, res) => {
  const result = await Authservice.credentialsLogin(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User login successful",
    data: result,
  });
});

export const AuthController = {
  credentialsLogin,
};
