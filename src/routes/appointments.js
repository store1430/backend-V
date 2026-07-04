import express from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.js";

const router = express.Router();

function validObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

function addIdFilter(filter, key, value) {
  if (validObjectId(value)) {
    filter[key] = value;
  }
}

function hasInvalidIdQuery(req, keys) {
  return keys.some((key) => req.query[key] && !validObjectId(req.query[key]));
}

router.get("/today", async (req, res, next) => {
  try {
    if (hasInvalidIdQuery(req, ["doctorId", "branchId"])) return res.json([]);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const filter = {
      appointmentDate: { $gte: start, $lt: end },
      status: "Booked"
    };

    addIdFilter(filter, "doctorId", req.query.doctorId);
    addIdFilter(filter, "branchId", req.query.branchId);

    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.get("/upcoming-video", async (req, res, next) => {
  try {
    if (hasInvalidIdQuery(req, ["userId"])) return res.json([]);

    const filter = {
      appointmentDate: { $gte: new Date() },
      appointmentType: "Video",
      status: "Booked"
    };

    addIdFilter(filter, "userId", req.query.userId);

    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      petName,
      petId,
      userId,
      doctorId,
      serviceType,
      categoryId,
      appointmentDate,
      timeSlot,
      appointmentType = "Clinic",
      branchId
    } = req.body;

    if (!petName || !serviceType || !appointmentDate || !timeSlot) {
      return res.status(400).json({ message: "Pet name, service, date, and time slot are required" });
    }

    const validCategoryId = validObjectId(categoryId) ? categoryId : undefined;
    const roomId = appointmentType === "Video" ? `maruthi-${validCategoryId || "consult"}-${Date.now()}` : undefined;

    const appointment = await Appointment.create({
      petName,
      petId: validObjectId(petId) ? petId : undefined,
      userId: validObjectId(userId) ? userId : undefined,
      doctorId: validObjectId(doctorId) ? doctorId : undefined,
      serviceType,
      categoryId: validCategoryId,
      appointmentDate,
      timeSlot,
      appointmentType,
      roomId,
      branchId: validObjectId(branchId) ? branchId : undefined
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    if (hasInvalidIdQuery(req, ["userId", "branchId"])) return res.json([]);

    const filter = {};
    addIdFilter(filter, "userId", req.query.userId);
    addIdFilter(filter, "branchId", req.query.branchId);
    const appointments = await Appointment.find(filter).sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

export default router;
