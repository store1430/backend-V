import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, trim: true },
    password: { type: String, required: true },
    imageUrl: { type: String }, // Optional profile picture
    imageFileId: { type: String },
    pets: [
      {
        name: { type: String, required: true, trim: true },
        petType: {
          type: String,
          required: true,
          enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
          default: "Other"
        },
        breed: { type: String, trim: true },
        gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
        age: { type: String, trim: true },
        birthDate: { type: String, trim: true }
      }
    ]
  },
  { timestamps: true, collection: "users" }
);

export const User = mongoose.model("User", userSchema);
