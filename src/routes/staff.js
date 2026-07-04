import express from "express";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";
import { Staff } from "../models/Staff.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// GET all staff (optional branchId filter)
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.branchId) filter.branchId = req.query.branchId;
    const staff = await Staff.find(filter).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    next(error);
  }
});

// POST create staff member
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { name, phone, about, experience, status = "Active", branchId } = req.body;

    if (!name || experience === undefined) {
      return res.status(400).json({ message: "Name and experience are required" });
    }

    let imageUrl;
    let imageFileId;

    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `staff_${Date.now()}_${req.file.originalname}`,
        folder: "/staff"
      });
      imageUrl = result.url;
      imageFileId = result.fileId;
    }

    const newStaff = new Staff({
      name,
      phone,
      about,
      experience: Number(experience),
      status,
      imageUrl,
      imageFileId,
      branchId: branchId || undefined
    });

    await newStaff.save();
    res.status(201).json(newStaff);
  } catch (error) {
    next(error);
  }
});

// PUT update staff member
router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { name, phone, about, experience, status, branchId } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (about !== undefined) updates.about = about;
    if (experience !== undefined) updates.experience = Number(experience);
    if (status) updates.status = status;
    if (branchId !== undefined) updates.branchId = branchId || undefined;

    if (req.file) {
      // Delete old image from imagekit if exists
      const existing = await Staff.findById(req.params.id);
      if (existing?.imageFileId) {
        try { await imagekit.deleteFile(existing.imageFileId); } catch {}
      }

      const result = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `staff_${Date.now()}_${req.file.originalname}`,
        folder: "/staff"
      });
      updates.imageUrl = result.url;
      updates.imageFileId = result.fileId;
    }

    const updated = await Staff.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Staff member not found" });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE staff member
router.delete("/:id", async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff member not found" });

    if (staff.imageFileId) {
      try { await imagekit.deleteFile(staff.imageFileId); } catch {}
    }
    res.json({ success: true, message: "Staff member deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
