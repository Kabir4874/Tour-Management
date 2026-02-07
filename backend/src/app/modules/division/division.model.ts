import { model, Schema } from "mongoose";
import type { IDivision } from "./division.interface.js";

const divisionSchema = new Schema<IDivision>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    thumbnail: { type: String },
    description: { type: String },
  },
  { timestamps: true },
);

export const Division = model<IDivision>("Division", divisionSchema);
