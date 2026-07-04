import express from "express";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";
import { ServiceCategory } from "../models/ServiceCategory.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.branchId) {
      filter.branchId = req.query.branchId;
    }

    let categories = await ServiceCategory.find(filter).sort({ createdAt: -1 });

    // Fallback to global categories if none are configured for this branch
    if (req.query.branchId && categories.length === 0) {
      const fallbackFilter = req.query.status ? { status: req.query.status } : {};
      categories = await ServiceCategory.find({
        ...fallbackFilter,
        $or: [{ branchId: { $exists: false } }, { branchId: null }]
      }).sort({ createdAt: -1 });
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get("/active", async (req, res, next) => {
  try {
    const filter = { status: "Active" };
    if (req.query.branchId) {
      filter.branchId = req.query.branchId;
    }
    let categories = await ServiceCategory.find(filter).sort({ name: 1 });

    // Fallback to global active categories
    if (req.query.branchId && categories.length === 0) {
      categories = await ServiceCategory.find({
        status: "Active",
        $or: [{ branchId: { $exists: false } }, { branchId: null }]
      }).sort({ name: 1 });
    }

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { name, status = "Active", branchId } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({ message: "Name and image are required" });
    }

    const uploaded = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `service-category-${Date.now()}-${req.file.originalname}`,
      folder: "/maruthi-pet-clinic/service-categories"
    });

    const category = await ServiceCategory.create({
      name,
      status,
      imageUrl: uploaded.url,
      imageFileId: uploaded.fileId,
      branchId: branchId || undefined
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/subcategories", upload.single("image"), async (req, res, next) => {
  try {
    const { name, price, status = "Active" } = req.body;
    if (!name || price === undefined || !req.file) {
      return res.status(400).json({ message: "Name, price, and image are required" });
    }
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const uploaded = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `subcategory-${Date.now()}-${req.file.originalname}`,
      folder: "/maruthi-pet-clinic/subcategories"
    });

    category.subCategories.push({
      name,
      price: Number(price),
      status,
      imageUrl: uploaded.url,
      imageFileId: uploaded.fileId
    });
    await category.save();
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/subcategories/:subId", async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const sub = category.subCategories.find((s) => s._id.toString() === req.params.subId);
    if (sub && sub.imageFileId) {
      await imagekit.deleteFile(sub.imageFileId).catch(() => {});
    }

    category.subCategories = category.subCategories.filter(
      (sub) => sub._id.toString() !== req.params.subId
    );
    await category.save();
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { name, status, branchId } = req.body;
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;
    if (status) category.status = status;
    if (branchId !== undefined) {
      category.branchId = branchId || undefined;
    }

    if (req.file) {
      const uploaded = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `service-category-${Date.now()}-${req.file.originalname}`,
        folder: "/maruthi-pet-clinic/service-categories"
      });

      if (category.imageFileId) {
        await imagekit.deleteFile(category.imageFileId).catch(() => {});
      }

      category.imageUrl = uploaded.url;
      category.imageFileId = uploaded.fileId;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.imageFileId) {
      await imagekit.deleteFile(category.imageFileId).catch(() => {});
    }

    await ServiceCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
