import { db } from "../config/db.js";

// Get all users (admin only)
export const getAllUsers = (req, res) => {
  db.query("SELECT id, full_name, email, role, created_at FROM users", (err, data) => {
    if (err) return res.status(500).json("Database error");
    return res.status(200).json(data);
  });
};

// Delete user (admin only)
export const deleteUser = (req, res) => {
  const { id } = req.params;
  
  // Prevent deleting admin users
  db.query("SELECT role FROM users WHERE id = ?", [id], (err, data) => {
    if (err) return res.status(500).json("Database error");
    if (!data.length) return res.status(404).json("User not found");
    if (data[0].role === 'admin') return res.status(403).json("Cannot delete admin user");
    
    db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json("Failed to delete user");
      return res.status(200).json("User deleted successfully");
    });
  });
};