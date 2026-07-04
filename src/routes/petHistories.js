import express from "express";
import { PetHistory } from "../models/PetHistory.js";

const router = express.Router();

router.get("/:petId", async (req, res, next) => {
  try {
    const history = await PetHistory.find({ petId: req.params.petId }).sort({ visitDate: -1 });
    res.json(history);
  } catch (error) {
    next(error);
  }
});

export default router;
