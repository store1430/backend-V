import express from "express";
import { Branch } from "../models/Branch.js";

const router = express.Router();

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
router.post("/", async (req, res, next) => {
  try {
    const { name, city, address, phone, isActive } = req.body;
    if (!name || !city) {
      return res.status(400).json({ message: "Name and city are required" });
    }
    const branch = new Branch({ name, city, address, phone, isActive });
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    next(error);
  }
});

// PUT update branch
router.put("/:id", async (req, res, next) => {
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
    if (isActive !== undefined) branch.isActive = isActive;

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
    await branch.deleteOne();
    res.json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
