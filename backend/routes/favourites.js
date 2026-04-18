import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET /api/favourites/:userId - get all favourites for a user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  db.query(
    `SELECT f.bike_id, b.name, b.type, b.price_per_hour, b.image_url, b.available, b.description
     FROM favourites f JOIN bikes b ON f.bike_id = b.id
     WHERE f.user_id = ? ORDER BY f.created_at DESC`,
    [userId],
    (err, data) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(data);
    }
  );
});

// POST /api/favourites - add favourite
router.post("/", (req, res) => {
  const { user_id, bike_id } = req.body;
  db.query(
    "INSERT IGNORE INTO favourites (user_id, bike_id) VALUES (?, ?)",
    [user_id, bike_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Added to favourites" });
    }
  );
});

// DELETE /api/favourites - remove favourite
router.delete("/", (req, res) => {
  const { user_id, bike_id } = req.body;
  db.query(
    "DELETE FROM favourites WHERE user_id = ? AND bike_id = ?",
    [user_id, bike_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Removed from favourites" });
    }
  );
});

export default router;
