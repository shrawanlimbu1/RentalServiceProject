import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET /api/users - Get all users with rental count
router.get("/", (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.created_at,
      COUNT(r.id) as rental_count
    FROM users u
    LEFT JOIN rentals r ON u.id = r.user_id
    GROUP BY u.id, u.full_name, u.email, u.role, u.created_at
    ORDER BY u.created_at DESC
  `;
  
  db.query(query, (err, users) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
    res.json(users);
  });
});

export default router;