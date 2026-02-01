import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { DivisionService } from "./division.service.js";

const createDivision = catchAsync(async (req, res) => {
  const result = await DivisionService.createDivision(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Division created",
    data: result,
  });
});

const getAllDivisions = catchAsync(async (req, res) => {
  const result = await DivisionService.getAllDivisions();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Division retrieved",
    data: result,
  });
});

const getSingleDivision = catchAsync(async (req, res) => {
  const slug = req.params.slug as string;
  const result = await DivisionService.getSingleDivision(slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Division retrieved",
    data: result,
  });
});

const updatedDivision = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await DivisionService.updateDivision(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Division updated",
    data: result,
  });
});

const deleteDivision = catchAsync(async (req, res) => {
  const result = await DivisionService.deleteDivision(req.params.id as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Division deleted",
    data: result,
  });
});

export const DivisionController = {
  createDivision,
  getAllDivisions,
  getSingleDivision,
  updatedDivision,
  deleteDivision,
};
