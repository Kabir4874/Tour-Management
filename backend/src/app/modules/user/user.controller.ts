import { StatusCodes } from "http-status-codes";
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
  const result = await UserService.getAllUsers();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id as string;
  const verifiedToken = req.user;
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
  updateUser,
};
