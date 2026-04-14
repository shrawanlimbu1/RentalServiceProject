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
      u.license_number,
      u.created_at,
      COUNT(r.id) as rental_count
    FROM users u
    LEFT JOIN rentals r ON u.id = r.user_id
    GROUP BY u.id, u.full_name, u.email, u.role, u.license_number, u.created_at
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

// PUT /api/users/:id - Update user profile
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { full_name, email, license_number } = req.body;

  // Add license_number column if it doesn't exist
  db.query("ALTER TABLE users ADD COLUMN license_number VARCHAR(50)", () => {
    const query = `UPDATE users SET full_name = ?, email = ?, license_number = ? WHERE id = ?`;
    
    db.query(query, [full_name, email, license_number, id], (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ message: "Failed to update profile" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Profile updated successfully" });
    });
  });
});

export default router;