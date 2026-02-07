import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import { verifyToken } from "../../utils/jwt.js";
import { createAccessToken } from "../../utils/token.js";
import { IsActive } from "../user/user.interface.js";
import User from "../user/user.model.js";

const getNewAccessToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const user = await User.findById(verifiedRefreshToken.userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User does not exist");
  }
  if (
    user.isActive === IsActive.BLOCKED ||
    user.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, `User is ${user.isActive}`);
  }
  if (user.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
  }

  const accessToken = createAccessToken(user);

  return { accessToken };
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId).select("+password");
  if (!user?.password) {
    throw new AppError(StatusCodes.NOT_FOUND, "Password not found");
  }
  const isOldPasswordMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordMatched) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Old password does not match");
  }
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    envVars.BCRYPT_SALT_ROUND
  );
  user.password = newHashedPassword;
  await user.save();
};

export const Authservice = {
  getNewAccessToken,
  resetPassword,
};
