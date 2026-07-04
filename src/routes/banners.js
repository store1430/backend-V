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
    const query = { status: "Active" };
    if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }

    let banners = await Banner.find(query).sort({ order: 1 });

    // Fallback to global banners if none are defined for this branch
    if (req.query.branchId && banners.length === 0) {
      banners = await Banner.find({
        status: "Active",
        $or: [{ branchId: { $exists: false } }, { branchId: null }]
      }).sort({ order: 1 });
    }

    res.json(banners);
  } catch (error) {
    next(error);
  }
});

// GET all banners (admin — includes inactive)
router.get("/all", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }
    const banners = await Banner.find(query).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    next(error);
  }
});

// POST create banner (max 3 per branch or global)
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { branchId, title, status = "Active" } = req.body;
    
    // Count docs for specific branch or global
    const countQuery = branchId ? { branchId } : { $or: [{ branchId: { $exists: false } }, { branchId: null }] };
    const count = await Banner.countDocuments(countQuery);
    
    if (count >= 3) {
      return res.status(400).json({
        message: `Maximum 3 banners allowed for this ${branchId ? "branch" : "global list"}. Delete one first.`
      });
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
      title: title || "",
      imageUrl: uploaded.url,
      imageFileId: uploaded.fileId,
      order: count,
      branchId: branchId || undefined,
      status: status || "Active"
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
