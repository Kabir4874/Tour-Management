import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { UserService } from "./user.service.js";

const createUser = catchAsync(async (req, res) => {
  const user = await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User created successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(
    req.query as Record<string, string>,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMe = catchAsync(async (req, res) => {
  const verifiedToken = req.user as JwtPayload;
  const user = await UserService.getMe(verifiedToken.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const userId = req.params.id as string;
  const user = await UserService.getSingleUser(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id as string;
  const verifiedToken = req.user as JwtPayload;
  const user = await UserService.updateUser(userId, req.body, verifiedToken);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getMe,
  getSingleUser,
  updateUser,
};
