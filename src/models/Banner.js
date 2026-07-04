import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    imageFileId: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true }
  },
  { timestamps: true, collection: "banners" }
);

export const Banner = mongoose.model("Banner", bannerSchema);
