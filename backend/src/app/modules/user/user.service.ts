import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import {
  IProvider,
  Role,
  type IAuthProvider,
  type IUser,
} from "./user.interface.js";
import User from "./user.model.js";

const createUser = async (payload: IUser) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, password, auths, ...rest } = payload;

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcrypt.hash(
    password as string,
    envVars.BCRYPT_SALT_ROUND
  );

  const authProvider: IAuthProvider = {
    provider: IProvider.CREDENTIALS,
    providerId: email,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  user.password = "";
  return user;
};

const getAllUsers = async () => {
  const users = await User.find();
  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if ("auths" in payload) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You cannot update auth providers"
    );
  }

  if ("role" in payload) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
    }
    if (
      payload.role === Role.SUPER_ADMIN &&
      decodedToken.role !== Role.SUPER_ADMIN
    ) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Only super admins can assign super admin role"
      );
    }
  }

  if (
    "isActive" in payload ||
    "isDeleted" in payload ||
    "isVerified" in payload
  ) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

export const UserService = {
  createUser,
  getAllUsers,
  updateUser,
};
