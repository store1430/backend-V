import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    petName: { type: String, required: true, trim: true },
    petId: { type: mongoose.Schema.Types.ObjectId, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, index: true },
    serviceType: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory" },
    appointmentDate: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true },
    appointmentType: {
      type: String,
      enum: ["Clinic", "Video"],
      default: "Clinic"
    },
    status: {
      type: String,
      enum: ["Booked", "Completed", "Cancelled"],
      default: "Booked",
      index: true
    },
    roomId: { type: String, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", index: true }
  },
  { timestamps: true, collection: "appointments" }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
