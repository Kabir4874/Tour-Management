import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import { verifyToken } from "../../utils/jwt.js";
import { createAccessToken, createTokens } from "../../utils/token.js";
import { IsActive } from "../user/user.interface.js";
import User from "../user/user.model.js";

const credentialsLogin = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Wrong credentials");
  }

  const isMatched = bcrypt.compare(password, user.password as string);
  if (!isMatched) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Wrong credentials");
  }

  const { accessToken, refreshToken } = createTokens(user);

  user.password = "";
  return { accessToken, refreshToken, user };
};

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

export const Authservice = {
  credentialsLogin,
  getNewAccessToken,
};
