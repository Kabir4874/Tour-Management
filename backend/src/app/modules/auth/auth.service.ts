import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import { verifyToken } from "../../utils/jwt.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { createAccessToken } from "../../utils/token.js";
import {
  IProvider,
  IsActive,
  type IAuthProvider,
} from "../user/user.interface.js";
import User from "../user/user.model.js";

const getNewAccessToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET,
  ) as JwtPayload;

  const user = await User.findById(verifiedRefreshToken.userId).select(
    "-password",
  );

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

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
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
    envVars.BCRYPT_SALT_ROUND,
  );
  user.password = newHashedPassword;
  await user.save();
};

const setPassword = async (userId: string, password: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (
    user.password &&
    user.auths.some(
      (providerObject) => providerObject.provider === IProvider.GOOGLE,
    )
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already set your password. Now you can change the password from your profile password update",
    );
  }

  const newHashedPassword = await bcrypt.hash(
    password,
    envVars.BCRYPT_SALT_ROUND,
  );

  const credentialProvider: IAuthProvider = {
    provider: IProvider.CREDENTIALS,
    providerId: user.email,
  };
  const auths: IAuthProvider[] = [...user.auths, credentialProvider];

  user.password = newHashedPassword;
  user.auths = auths;
  await user.save();
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User does not exist");
  }
  if (
    user.isActive === IsActive.BLOCKED ||
    user.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, `User is ${user.isActive}`);
  }

  if (!user.isVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, `User is not verified`);
  }

  if (user.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${user._id}&token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Password Reset",
    templateName: "forgotPassword",
    templateData: {
      name: user.name,
      resetUILink,
    },
  });
};

const resetPassword = async (
  id: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  if (decodedToken.userId?.toString() !== id) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can not reset your password",
    );
  }
  const user = await User.findById(decodedToken.userId).select("+password");
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    envVars.BCRYPT_SALT_ROUND,
  );
  user.password = newHashedPassword;
  await user.save();
};

export const Authservice = {
  getNewAccessToken,
  resetPassword,
  changePassword,
  setPassword,
  forgotPassword,
};
