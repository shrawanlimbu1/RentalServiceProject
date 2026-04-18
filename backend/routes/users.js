import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET /api/users?id=X - Get single user with license photo
// GET /api/users     - Get all users with rental count
router.get("/", (req, res) => {
  const { id } = req.query;

  if (id) {
    db.query(
      "SELECT id, full_name, email, role, license_number, license_photo, created_at FROM users WHERE id = ?",
      [id],
      (err, data) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!data.length) return res.status(404).json({ message: "User not found" });
        res.json(data[0]);
      }
    );
    return;
  }

  const query = `
    SELECT 
      u.id, u.full_name, u.email, u.role,
      u.license_number, u.license_photo, u.created_at,
      (SELECT COUNT(*) FROM rentals r WHERE r.user_id = u.id) as rental_count
    FROM users u
    ORDER BY u.created_at DESC
  `;
  db.query(query, (err, users) => {
    if (err) return res.status(500).json({ message: "Failed to fetch users" });
    res.json(users);
  });
});

// PUT /api/users/:id - Update user profile
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { full_name, email, license_number, license_photo } = req.body;
  console.log(`Updating user ${id}, license_photo size: ${license_photo ? license_photo.length : 0}`);

  db.query(
    "UPDATE users SET full_name = ?, email = ?, license_number = ?, license_photo = ? WHERE id = ?",
    [full_name, email, license_number || null, license_photo || null, id],
    (err, result) => {
      if (err) { console.error("Error updating user:", err); return res.status(500).json({ message: "Failed to update profile" }); }
      if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
      res.json({ message: "Profile updated successfully" });
    }
  );
});

export default router;
