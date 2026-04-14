import express from "express";
import { getBikeRecommendations } from "../algorithms/recommendation.js";

const router = express.Router();

// GET /api/recommendations/:userId - Get bike recommendations for user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  
  getBikeRecommendations(userId, (err, recommendations) => {
    if (err) {
      console.error("Error getting recommendations:", err);
      return res.status(500).json({ message: "Failed to get recommendations" });
    }
    res.json(recommendations);
  });
});

export default router;