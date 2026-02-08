import { StatusCodes } from "http-status-codes";
import {
  cloudinaryUpload,
  extractPublicIdFromCloudinaryUrl,
} from "../../config/cloudinary.js";
import AppError from "../../errorHelpers/AppError.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { generateUniqueSlug } from "../../utils/slug.js";
import { tourSearchableFields } from "./tour.constant.js";
import type { ITour, ITourType } from "./tour.interface.js";
import { Tour, TourType } from "./tour.model.js";

const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });
  if (existingTour) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "A tour with this title already exists.",
    );
  }

  payload.slug = await generateUniqueSlug({
    value: payload.title,
    model: Tour,
  });

  const tour = await Tour.create(payload);
  return tour;
};

const getAllTours = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find(), query);

  const tours = queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new AppError(StatusCodes.NOT_FOUND, "Tour not found");
  }

  if (payload.title) {
    payload.slug = await generateUniqueSlug({
      value: payload.title,
      model: Tour,
      excludeId: id,
    });
  }

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

  if (payload.images && payload.images.length > 0) {
    await Promise.allSettled(
      (existingTour.images ?? []).map(async (imageUrl) => {
        const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);
        if (publicId) {
          await cloudinaryUpload.uploader.destroy(publicId);
        }
      }),
    );
  }

  return updatedTour;
};

const deleteTour = async (id: string) => {
  return await Tour.findByIdAndDelete(id);
};

const createTourType = async (payload: ITourType) => {
  const existingTourType = await TourType.findOne({ name: payload.name });
  if (existingTourType) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Tour type already exists.");
  }
  return await TourType.create({ name: payload.name });
};

const getAllTourTypes = async () => {
  return await TourType.find();
};
const updateTourType = async (id: string, payload: ITourType) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  const updatedTourType = await TourType.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updatedTourType;
};
const deleteTourType = async (id: string) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  return await TourType.findByIdAndDelete(id);
};

export const TourService = {
  createTour,
  createTourType,
  deleteTourType,
  updateTourType,
  getAllTourTypes,
  getAllTours,
  updateTour,
  deleteTour,
};
