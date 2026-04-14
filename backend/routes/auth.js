import express from "express";
import { login, signup } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/login - User login
router.post("/login", login);

// POST /api/auth/signup - User registration
router.post("/signup", signup);

export default router;