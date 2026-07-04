import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { imagekit } from "../config/imagekit.js";
import { Doctor } from "../models/Doctor.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

function publicDoctor(doctor) {
  const data = doctor.toObject ? doctor.toObject() : { ...doctor };
  delete data.password;
  return data;
}

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.branchId) filter.branchId = req.query.branchId;
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json(doctors.map(publicDoctor));
  } catch (error) {
    next(error);
  }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const {
      name,
      specialty,
      experience,
      status = "Active",
      education,
      bio,
      languages,
      expertise,
      jobsCompleted,
      rating,
      reviews,
      username,
      password,
      branchId
    } = req.body;
    if (!name || !specialty || !experience) {
      return res.status(400).json({ message: "Name, specialty, and experience are required" });
    }

    if (username) {
      const existing = await Doctor.findOne({ username });
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    let imageUrl = undefined;
    let imageFileId = undefined;

    if (req.file) {
      const uploaded = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `doctor-${Date.now()}-${req.file.originalname}`,
        folder: "/maruthi-pet-clinic/doctors"
      });
      imageUrl = uploaded.url;
      imageFileId = uploaded.fileId;
    }

    let languagesArr = undefined;
    if (languages) {
      try {
        languagesArr = Array.isArray(languages) ? languages : JSON.parse(languages);
      } catch {
        languagesArr = typeof languages === "string" ? languages.split(",").map((l) => l.trim()) : [];
      }
    }

    let expertiseArr = undefined;
    if (expertise) {
      try {
        expertiseArr = Array.isArray(expertise) ? expertise : JSON.parse(expertise);
      } catch {
        expertiseArr = typeof expertise === "string" ? expertise.split(",").map((e) => e.trim()) : [];
      }
    }

    let reviewsArr = undefined;
    if (reviews) {
      try {
        reviewsArr = Array.isArray(reviews) ? reviews : JSON.parse(reviews);
      } catch {
        reviewsArr = [];
      }
    }

    const doctor = await Doctor.create({
      name,
      specialty,
      experience: Number(experience),
      status,
      imageUrl,
      imageFileId,
      education: education || "Graduated",
      bio: bio || "",
      languages: languagesArr,
      expertise: expertiseArr,
      jobsCompleted: jobsCompleted !== undefined ? Number(jobsCompleted) : 0,
      rating: rating !== undefined ? Number(rating) : 5.0,
      reviews: reviewsArr,
      username: username || undefined,
      password: hashedPassword,
      branchId: branchId || undefined
    });

    res.status(201).json(publicDoctor(doctor));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const {
      name,
      specialty,
      experience,
      status,
      education,
      bio,
      languages,
      expertise,
      jobsCompleted,
      rating,
      reviews,
      username,
      password,
      branchId
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (username && username !== doctor.username) {
      const existing = await Doctor.findOne({ username });
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      doctor.username = username;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(password, salt);
    }

    if (name) doctor.name = name;
    if (specialty) doctor.specialty = specialty;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (status) doctor.status = status;
    if (education !== undefined) doctor.education = education;
    if (bio !== undefined) doctor.bio = bio;
    if (jobsCompleted !== undefined) doctor.jobsCompleted = Number(jobsCompleted);
    if (rating !== undefined) doctor.rating = Number(rating);
    if (branchId !== undefined) doctor.branchId = branchId || null;

    if (languages !== undefined) {
      try {
        doctor.languages = Array.isArray(languages) ? languages : JSON.parse(languages);
      } catch {
        doctor.languages = typeof languages === "string" ? languages.split(",").map((l) => l.trim()) : [];
      }
    }

    if (expertise !== undefined) {
      try {
        doctor.expertise = Array.isArray(expertise) ? expertise : JSON.parse(expertise);
      } catch {
        doctor.expertise = typeof expertise === "string" ? expertise.split(",").map((e) => e.trim()) : [];
      }
    }

    if (reviews !== undefined) {
      try {
        doctor.reviews = Array.isArray(reviews) ? reviews : JSON.parse(reviews);
      } catch {
        // do nothing
      }
    }

    if (req.file) {
      if (doctor.imageFileId) {
        await imagekit.deleteFile(doctor.imageFileId).catch(() => {});
      }
      const uploaded = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `doctor-${Date.now()}-${req.file.originalname}`,
        folder: "/maruthi-pet-clinic/doctors"
      });
      doctor.imageUrl = uploaded.url;
      doctor.imageFileId = uploaded.fileId;
    }

    await doctor.save();
    res.json(publicDoctor(doctor));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.imageFileId) {
      await imagekit.deleteFile(doctor.imageFileId).catch(() => {});
    }

    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const doctor = await Doctor.findOne({ username });
    if (!doctor) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (doctor.status !== "Active") {
      return res.status(401).json({ message: "Account is inactive" });
    }

    if (!doctor.password) {
      return res.status(401).json({ message: "Credentials not configured for this account" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: doctor._id, name: doctor.name, specialty: doctor.specialty, branchId: doctor.branchId },
      process.env.JWT_SECRET || "maruthi_pet_clinic_secret_key",
      { expiresIn: "30d" }
    );

    res.json({
      token,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialty: doctor.specialty,
        imageUrl: doctor.imageUrl,
        branchId: doctor.branchId
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
