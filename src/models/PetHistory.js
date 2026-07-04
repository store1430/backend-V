import mongoose from "mongoose";

const petHistorySchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    petName: { type: String, required: true },
    diagnosis: { type: String, required: true },
    prescription: { type: String },
    notes: { type: String },
    visitDate: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: "pet_histories" }
);

export const PetHistory = mongoose.model("PetHistory", petHistorySchema);
