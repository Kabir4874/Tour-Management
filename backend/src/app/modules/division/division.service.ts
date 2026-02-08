import { StatusCodes } from "http-status-codes";
import {
  cloudinaryUpload,
  extractPublicIdFromCloudinaryUrl,
} from "../../config/cloudinary.js";
import AppError from "../../errorHelpers/AppError.js";
import { generateUniqueSlug } from "../../utils/slug.js";
import type { IDivision } from "./division.interface.js";
import { Division } from "./division.model.js";

const createDivision = async (payload: IDivision) => {
  const existingDivision = await Division.findOne({ name: payload.name });
  if (existingDivision) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "A division with this name already exists.",
    );
  }
  payload.slug = await generateUniqueSlug({
    value: payload.name,
    suffix: "division",
    model: Division,
  });
  const division = await Division.create(payload);
  return division;
};

const getAllDivisions = async () => {
  const divisions = await Division.find();
  const totalDivisions = await Division.countDocuments();
  return {
    data: divisions,
    meta: {
      total: totalDivisions,
    },
  };
};

const getSingleDivision = async (slug: string) => {
  const division = await Division.findOne({ slug });
  return division;
};

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
  const existingDivision = await Division.findById(id);
  if (!existingDivision) {
    throw new AppError(StatusCodes.NOT_FOUND, "Division not found.");
  }

  if (payload.name) {
    const duplicateDivision = await Division.findOne({
      name: payload.name,
      _id: { $ne: id },
    });

    if (duplicateDivision) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "A division with this name already exists.",
      );
    }

    payload.slug = await generateUniqueSlug({
      value: payload.name,
      suffix: "division",
      model: Division,
      excludeId: id,
    });
  }

  const updatedDivision = await Division.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (
    payload.thumbnail &&
    existingDivision.thumbnail &&
    payload.thumbnail !== existingDivision.thumbnail
  ) {
    const publicId = extractPublicIdFromCloudinaryUrl(existingDivision.thumbnail);
    if (publicId) {
      await cloudinaryUpload.uploader.destroy(publicId);
    }
  }

  return updatedDivision;
};

const deleteDivision = async (id: string) => {
  await Division.findByIdAndDelete(id);
  return null;
};

export const DivisionService = {
  createDivision,
  getAllDivisions,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};
