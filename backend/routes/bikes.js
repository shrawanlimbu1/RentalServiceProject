import express from "express";
import { addBike, getAllBikes, updateBike, deleteBike } from "../controllers/bikeController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST /api/bikes - Add new bike with image upload (admin only)
router.post("/", upload.single('image'), addBike);

// GET /api/bikes - Get all bikes (public)
router.get("/", getAllBikes);

// PUT /api/bikes/:id - Update bike with optional image upload (admin only)
router.put("/:id", upload.single('image'), updateBike);

// DELETE /api/bikes/:id - Delete bike (admin only)
router.delete("/:id", deleteBike);

export default router;
