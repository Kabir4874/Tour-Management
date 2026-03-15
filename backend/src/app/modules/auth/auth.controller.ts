import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { clearAuthCookies, setAuthCookies } from "../../utils/cookie.js";
import sendResponse from "../../utils/sendResponse.js";
import { createTokens } from "../../utils/token.js";
import { Authservice } from "./auth.service.js";

const isProduction = envVars.NODE_ENV === "production";

const getAuthFailureStatusCode = (message?: string) => {
  if (message === "Wrong credentials" || message === "User is not verified") {
    return StatusCodes.UNAUTHORIZED;
  }

  return StatusCodes.BAD_REQUEST;
};

const credentialsLogin = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.authenticate("local", async (error: any, user: any, info: any) => {
    if (error) {
      if (error instanceof Error) {
        return next(new AppError(StatusCodes.UNAUTHORIZED, error.message));
      }

      return next(new AppError(StatusCodes.UNAUTHORIZED, String(error)));
    }

    if (!user) {
      return next(
        new AppError(
          getAuthFailureStatusCode(info?.message),
          info?.message || "Authentication failed",
        ),
      );
    }

    const { accessToken, refreshToken } = createTokens(user);
    setAuthCookies(
      res,
      { accessToken, refreshToken },
      {
        isProduction,
      },
    );
    user.password = "";
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User login successful",
      data: { accessToken, refreshToken, user },
    });
  })(req, res, next);
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
      isProduction,
    },
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Access token updated",
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  clearAuthCookies(res, isProduction);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { newPassword, id } = req.body;
  const decodedToken = req.user as JwtPayload;
  await Authservice.resetPassword(id, newPassword, decodedToken);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password reset success",
    data: null,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const decodedToken = req.user as JwtPayload;
  await Authservice.changePassword(oldPassword, newPassword, decodedToken);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password change success",
    data: null,
  });
});

const setPassword = catchAsync(async (req, res) => {
  const { password } = req.body;
  const decodedToken = req.user as JwtPayload;
  await Authservice.setPassword(decodedToken.userId, password);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password set success",
    data: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  await Authservice.forgotPassword(email);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Email sent successfully",
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
      isProduction,
    },
  );

  res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
});

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  changePassword,
  setPassword,
  forgotPassword,
  googleLogin,
  googleCallback,
};
