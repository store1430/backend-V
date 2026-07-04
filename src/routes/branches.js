import express from "express";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";
import { Branch } from "../models/Branch.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// GET all branches
router.get("/", async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.json(branches);
  } catch (error) {
    next(error);
  }
});

// POST create branch
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { name, city, address, phone, isActive = true } = req.body;
    if (!name || !city) {
      return res.status(400).json({ message: "Name and city are required" });
    }

    let imageUrl = "";
    let imageFileId = "";

    if (req.file) {
      const uploaded = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `branch-${Date.now()}-${req.file.originalname}`,
        folder: "/maruthi-pet-clinic/branches"
      });
      imageUrl = uploaded.url;
      imageFileId = uploaded.fileId;
    }

    const branch = new Branch({
      name,
      city,
      address,
      phone,
      imageUrl,
      imageFileId,
      isActive: isActive === "true" || isActive === true
    });

    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    next(error);
  }
});

// PUT update branch
router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { name, city, address, phone, isActive } = req.body;
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (name) branch.name = name;
    if (city) branch.city = city;
    if (address !== undefined) branch.address = address;
    if (phone !== undefined) branch.phone = phone;
    
    if (isActive !== undefined) {
      branch.isActive = isActive === "true" || isActive === true;
    }

    if (req.file) {
      // Upload new image
      const uploaded = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `branch-${Date.now()}-${req.file.originalname}`,
        folder: "/maruthi-pet-clinic/branches"
      });

      // Delete old image if it exists
      if (branch.imageFileId) {
        try {
          await imagekit.deleteFile(branch.imageFileId);
        } catch (delErr) {
          console.error("Failed to delete old branch image from ImageKit", delErr);
        }
      }

      branch.imageUrl = uploaded.url;
      branch.imageFileId = uploaded.fileId;
    }

    await branch.save();
    res.json(branch);
  } catch (error) {
    next(error);
  }
});

// DELETE delete branch
router.delete("/:id", async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Delete ImageKit image if it exists
    if (branch.imageFileId) {
      try {
        await imagekit.deleteFile(branch.imageFileId);
      } catch (delErr) {
        console.error("Failed to delete branch image from ImageKit", delErr);
      }
    }

    await branch.deleteOne();
    res.json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
