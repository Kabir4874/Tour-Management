import { model, Schema, Types } from "mongoose";
import type { ITour, ITourType } from "./tour.interface.js";

const tourTypeSchema = new Schema<ITourType>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const TourType = model<ITourType>("TourType", tourTypeSchema);

const tourSchema = new Schema<ITour>(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    images: { type: [String], default: [] },
    location: { type: String },
    costFrom: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    departureLocation: { type: String },
    arrivalLocation: { type: String },
    included: { type: [String], default: [] },
    excluded: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    tourPlan: { type: [String], default: [] },
    maxGuest: { type: Number },
    minAge: { type: Number },
    division: { type: Types.ObjectId, ref: "Division", required: true },
    tourType: { type: Types.ObjectId, ref: "TourType", required: true },
  },
  { timestamps: true },
);

export const Tour = model<ITour>("Tour", tourSchema);
