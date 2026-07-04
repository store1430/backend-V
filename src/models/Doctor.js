import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    experience: { type: Number, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
    imageUrl: { type: String },
    imageFileId: { type: String },
    education: { type: String, default: "Graduated" },
    bio: { type: String, default: "" },
    languages: { type: [String], default: ["English", "Hindi"] },
    expertise: { type: [String], default: ["Dog", "Cat"] },
    jobsCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    reviews: { type: [reviewSchema], default: [] },
    username: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", index: true }
  },
  { timestamps: true, collection: "doctors" }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
