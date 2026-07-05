import express from "express";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";
import { Branch } from "../models/Branch.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

function publicBranch(branch) {
  const data = branch.toObject ? branch.toObject() : { ...branch };
  delete data.password;
  return data;
}

// GET all branches
router.get("/", async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.json(branches.map(publicBranch));
  } catch (error) {
    next(error);
  }
});

// POST login branch
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const branch = await Branch.findOne({ username: username.trim() });
    if (!branch || branch.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ success: true, branch: publicBranch(branch) });
  } catch (error) {
    next(error);
  }
});

// POST create branch
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { name, city, address, phone, state = "Telangana", username, password, isActive = true } = req.body;
    if (!name || !city) {
      return res.status(400).json({ message: "Name and city are required" });
    }

    if (username) {
      const existing = await Branch.findOne({ username: username.trim() });
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
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
      state,
      username: username ? username.trim() : undefined,
      password: password || undefined,
      isActive: isActive === "true" || isActive === true
    });

    await branch.save();
    res.status(201).json(publicBranch(branch));
  } catch (error) {
    next(error);
  }
});

// PUT update branch
router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { name, city, address, phone, state, username, password, isActive } = req.body;
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (username && username.trim() !== branch.username) {
      const existing = await Branch.findOne({ username: username.trim() });
      if (existing) {
        return res.status(400).json({ message: "Username already taken by another branch" });
      }
      branch.username = username.trim();
    }

    if (name) branch.name = name;
    if (city) branch.city = city;
    if (address !== undefined) branch.address = address;
    if (phone !== undefined) branch.phone = phone;
    if (state) branch.state = state;
    if (password) branch.password = password;
    
    if (isActive !== undefined) {
      branch.isActive = isActive === "true" || isActive === true;
    }

    if (req.body.videoCallPrice !== undefined) {
      branch.videoCallPrice = Number(req.body.videoCallPrice);
    }

    if (req.body.availableDates !== undefined) {
      try {
        const dates = typeof req.body.availableDates === "string"
          ? JSON.parse(req.body.availableDates)
          : req.body.availableDates;
        if (Array.isArray(dates)) {
          branch.availableDates = dates;
        }
      } catch (err) {
        console.warn("Failed to parse availableDates:", err);
      }
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
    res.json(publicBranch(branch));
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
