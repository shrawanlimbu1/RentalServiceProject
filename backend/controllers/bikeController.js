import { db } from "../config/db.js";

export const addBike = (req, res) => {
  const { name, type, price_per_hour, description, image_url, available } = req.body;
  
  console.log('Adding bike with data:', req.body);
  console.log('Uploaded file:', req.file);
  
  // Validate required fields
  if (!name || !type || !price_per_hour) {
    return res.status(400).json("Name, type, and price are required");
  }

  // Use uploaded file path or provided image_url
  const finalImageUrl = req.file ? `/uploads/bikes/${req.file.filename}` : (image_url || '');

  db.query(
    "INSERT INTO bikes (name, type, price_per_hour, description, image_url, available) VALUES (?, ?, ?, ?, ?, ?)",
    [name, type, parseFloat(price_per_hour), description || '', finalImageUrl, available !== false],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json("Failed to add bike: " + err.message);
      }
      return res.status(201).json({ message: "Bike added successfully", id: result.insertId });
    }
  );
};

export const getAllBikes = (req, res) => {
  db.query("SELECT * FROM bikes", (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updateBike = (req, res) => {
  const { id } = req.params;
  const { name, type, price_per_hour, description, image_url, available } = req.body;

  // Use uploaded file path or keep existing image_url
  const finalImageUrl = req.file ? `/uploads/bikes/${req.file.filename}` : image_url;

  db.query(
    "UPDATE bikes SET name=?, type=?, price_per_hour=?, description=?, image_url=?, available=? WHERE id=?",
    [name, type, parseFloat(price_per_hour), description, finalImageUrl, available, id],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json("Failed to update bike: " + err.message);
      }
      return res.status(200).json({ message: "Bike updated successfully" });
    }
  );
};

export const deleteBike = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM bikes WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Bike deleted successfully" });
  });
};
