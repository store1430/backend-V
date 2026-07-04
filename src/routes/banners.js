import express from "express";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";
import { Banner } from "../models/Banner.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// GET all active banners (public — for user app)
router.get("/", async (req, res, next) => {
  try {
    const banners = await Banner.find({ status: "Active" }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    next(error);
  }
});

// GET all banners (admin — includes inactive)
router.get("/all", async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    next(error);
  }
});

// POST create banner (max 3)
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const count = await Banner.countDocuments();
    if (count >= 3) {
      return res.status(400).json({ message: "Maximum 3 banners allowed. Delete one to add a new banner." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    const uploaded = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `banner-${Date.now()}-${req.file.originalname}`,
      folder: "/maruthi-pet-clinic/banners"
    });

    const banner = await Banner.create({
      title: req.body.title || "",
      imageUrl: uploaded.url,
      imageFileId: uploaded.fileId,
      order: count,
      status: req.body.status || "Active"
    });

    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
});

// DELETE banner
router.delete("/:id", async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    if (banner.imageFileId) {
      await imagekit.deleteFile(banner.imageFileId).catch(() => {});
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
