import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { TourService } from "./tour.service.js";

const createTour = catchAsync(async (req, res) => {
  const result = await TourService.createTour(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Tour created",
    data: result,
  });
});

const getAllTours = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await TourService.getAllTours(query as Record<string, string>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour retrieved",
    data: result,
  });
});

const updateTour = catchAsync(async (req, res) => {
  const result = await TourService.updateTour(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour updated",
    data: result,
  });
});

const deleteTour = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TourService.deleteTour(id as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour deleted",
    data: result,
  });
});
const getAllTourTypes = catchAsync(async (req, res) => {
  const result = await TourService.getAllTourTypes();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour types retrieved",
    data: result,
  });
});

const createTourType = catchAsync(async (req, res) => {
  const result = await TourService.createTourType(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Tour type created",
    data: result,
  });
});

const updateTourType = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TourService.updateTourType(id as string, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour type updated",
    data: result,
  });
});
const deleteTourType = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TourService.deleteTourType(id as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour type deleted",
    data: result,
  });
});

export const TourController = {
  createTour,
  createTourType,
  getAllTourTypes,
  deleteTourType,
  updateTourType,
  getAllTours,
  updateTour,
  deleteTour,
};
