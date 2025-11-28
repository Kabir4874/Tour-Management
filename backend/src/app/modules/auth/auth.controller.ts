import { StatusCodes } from "http-status-codes";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { setAuthCookies } from "../../utils/cookie.js";
import sendResponse from "../../utils/sendResponse.js";
import { Authservice } from "./auth.service.js";

const credentialsLogin = catchAsync(async (req, res) => {
  const result = await Authservice.credentialsLogin(req.body);
  const { accessToken, refreshToken } = result;

  setAuthCookies(
    res,
    { accessToken, refreshToken },
    {
      secure: envVars.NODE_ENV === "production",
    }
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User login successful",
    data: result,
  });
});

const getNewAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No refresh token found");
  }
  const result = await Authservice.getNewAccessToken(refreshToken);
  const { accessToken } = result;
  setAuthCookies(
    res,
    { accessToken },
    {
      secure: envVars.NODE_ENV === "production",
    }
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Access token updated",
    data: result,
  });
});

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
};
