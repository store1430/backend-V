import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    about: { type: String, default: "" },
    experience: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
    imageUrl: { type: String },
    imageFileId: { type: String },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", index: true }
  },
  { timestamps: true, collection: "staff" }
);

export const Staff = mongoose.model("Staff", staffSchema);
