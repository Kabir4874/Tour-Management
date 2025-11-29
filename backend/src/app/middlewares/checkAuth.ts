import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import envVars from "../config/env.js";
import AppError from "../errorHelpers/AppError.js";
import { IsActive } from "../modules/user/user.interface.js";
import User from "../modules/user/user.model.js";
import { verifyToken } from "../utils/jwt.js";

const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;
      if (!accessToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "No token received");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const user = await User.findById(verifiedToken.userId);

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

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          "You are not permitted to view this content"
        );
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };

export default checkAuth;
