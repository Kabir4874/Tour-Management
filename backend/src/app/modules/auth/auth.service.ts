import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import envVars from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import { generateToken } from "../../utils/jwt.js";
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

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );
  return { accessToken };
};

export const Authservice = {
  credentialsLogin,
};
