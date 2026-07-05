import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { imagekit } from "../config/imagekit.js";
import { User } from "../models/User.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/auth/register
router.post("/register", upload.single("image"), async (req, res, next) => {
  try {
    const { name, phone, email, password, petName, petType, breed, gender, age, petBirthDate } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Name, phone, and password are required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ message: "Phone number is already registered" });
    }

    let imageUrl = "";
    let imageFileId = "";

    // Upload profile image to ImageKit if provided
    if (req.file) {
      try {
        const uploaded = await imagekit.upload({
          file: req.file.buffer.toString("base64"),
          fileName: `user-${Date.now()}-${req.file.originalname}`,
          folder: "/maruthi-pet-clinic/users"
        });
        imageUrl = uploaded.url;
        imageFileId = uploaded.fileId;
      } catch (err) {
        console.warn("Image upload failed, continuing without profile picture:", err);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initial pet onboarding (only if petName is provided)
    const pets = [];
    if (petName && petName.trim()) {
      pets.push({
        name: petName.trim(),
        petType: petType || "Other",
        breed: breed || "",
        gender: gender || "Unknown",
        age: age || "",
        birthDate: petBirthDate || ""
      });
    }

    const user = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      password: hashedPassword,
      imageUrl,
      imageFileId,
      pets
    });

    // Don't return password in response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid phone number or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid phone number or password" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    next(error);
  }
});

export default router;
