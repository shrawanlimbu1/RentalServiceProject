import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const signup = (req, res) => {
  const { full_name, email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, data) => {
    if (err) return res.status(500).json("Database error");
    if (data.length) return res.status(400).json("User already exists!");

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (full_name, email, password, role) VALUES(?, ?, ?, ?)",
        [full_name, email, hashedPassword, "user"],
        (err) => {
          if (err) return res.status(500).json("Registration failed");
          return res.status(200).json("User registered successfully!");
        }
      );
    } catch (error) {
      return res.status(500).json("Password hashing failed");
    }
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, data) => {
    if (err) return res.status(500).json("Database error");
    if (!data.length) return res.status(404).json("User not found!");

    try {
      const validPassword = await bcrypt.compare(password, data[0].password);
      if (!validPassword) return res.status(401).json("Invalid credentials!");

      const token = jwt.sign(
        { id: data[0].id, email: data[0].email, role: data[0].role },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        token,
        user: {
          id: data[0].id,
          full_name: data[0].full_name,
          email: data[0].email,
          role: data[0].role
        }
      });
    } catch (error) {
      return res.status(500).json("Authentication failed");
    }
  });
};



