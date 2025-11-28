import envVars from "../config/env.js";
import type { IUser } from "../modules/user/user.interface.js";
import { generateToken } from "./jwt.js";

type JwtUser = Pick<IUser, "_id" | "email" | "role"> | Partial<IUser>;

const buildJwtPayload = (user: JwtUser) => ({
  userId: user._id,
  email: user.email,
  role: user.role,
});

export const createAccessToken = (user: JwtUser) => {
  const payload = buildJwtPayload(user);

  return generateToken(
    payload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );
};

export const createRefreshToken = (user: JwtUser) => {
  const payload = buildJwtPayload(user);

  return generateToken(
    payload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );
};

export const createTokens = (user: JwtUser) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  return { accessToken, refreshToken };
};
