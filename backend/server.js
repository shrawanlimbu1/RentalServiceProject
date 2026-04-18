import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import bikeRoutes from "./routes/bikes.js";
import userRoutes from "./routes/users.js";
import rentalRoutes from "./routes/rentals.js";
import recommendationRoutes from "./routes/recommendations.js";
import favouriteRoutes from "./routes/favourites.js";

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// ✅ CORS FIX (VERY IMPORTANT)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Parse JSON bodies with increased limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/favourites", favouriteRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
