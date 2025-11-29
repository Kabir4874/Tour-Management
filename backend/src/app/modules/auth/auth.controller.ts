import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { setAuthCookies } from "../../utils/cookie.js";
import sendResponse from "../../utils/sendResponse.js";
import { createTokens } from "../../utils/token.js";
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

const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const decodedToken = req.user as JwtPayload;
  await Authservice.resetPassword(oldPassword, newPassword, decodedToken);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password reset success",
    data: null,
  });
});

const googleLogin = catchAsync(async (req, res) => {
  const redirect = req.query.redirect || "/";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect as string,
  })(req, res);
});

const googleCallback = catchAsync(async (req, res) => {
  let redirectTo = req.query.redirectTo ? (req.query.redirectTo as string) : "";
  if (redirectTo.startsWith("/")) {
    redirectTo = redirectTo.slice(1);
  }
  const user = req.user;
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  const { accessToken, refreshToken } = createTokens(user);

  setAuthCookies(
    res,
    { accessToken, refreshToken },
    {
      secure: envVars.NODE_ENV === "production",
    }
  );

  res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
});


export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  googleLogin,
  googleCallback,
};
