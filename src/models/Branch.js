import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    imageFileId: { type: String, trim: true },
    state: { type: String, default: "Telangana", trim: true },
    username: { type: String, trim: true, index: true },
    password: { type: String },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true, collection: "branches" }
);

export const Branch = mongoose.model("Branch", branchSchema);
