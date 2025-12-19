import express from "express";
import { getAllRentals, confirmRental, createRental, returnBike, getUserRentals, cancelRental } from "../controllers/rentalController.js";

const router = express.Router();

// GET /api/rentals - Get all rentals
router.get("/", getAllRentals);

// PUT /api/rentals/:id/confirm - Confirm rental (admin only)
router.put("/:id/confirm", confirmRental);

// POST /api/rentals - Create new rental
router.post("/", createRental);

// PUT /api/rentals/:id/return - Return bike
router.put("/:id/return", returnBike);

// GET /api/rentals/user/:userId - Get user's rentals
router.get("/user/:userId", getUserRentals);

// PUT /api/rentals/:id/cancel - Cancel rental
router.put("/:id/cancel", cancelRental);

export default router;