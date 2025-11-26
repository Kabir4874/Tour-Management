import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User from "./user.model.js";

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Something Went Wrong",
    });
  }
};

export const UserController = {
  createUser,
};
