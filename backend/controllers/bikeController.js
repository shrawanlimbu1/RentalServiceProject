// Import database connection
import { db } from "../config/db.js";

/**
 * Add a new bike to the database
 * @route POST /api/bikes
 * @access Admin only
 */
export const addBike = (req, res) => {
  // Extract bike details from request body
  const { name, type, price_per_hour, description, image_url, available } = req.body;
  
  // Log incoming data for debugging
  console.log('Adding bike with data:', req.body);
  console.log('Uploaded file:', req.file);
  
  // Validate required fields before proceeding
  if (!name || !type || !price_per_hour) {
    return res.status(400).json("Name, type, and price are required");
  }

  // Determine final image URL: use uploaded file path or provided base64/URL
  const finalImageUrl = req.file ? `/uploads/bikes/${req.file.filename}` : (image_url || '');

  // Insert new bike into database
  db.query(
    "INSERT INTO bikes (name, type, price_per_hour, description, image_url, available) VALUES (?, ?, ?, ?, ?, ?)",
    [name, type, parseFloat(price_per_hour), description || '', finalImageUrl, available !== false],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json("Failed to add bike: " + err.message);
      }
      // Return success with new bike ID
      return res.status(201).json({ message: "Bike added successfully", id: result.insertId });
    }
  );
};

/**
 * Get all bikes from database
 * @route GET /api/bikes
 * @access Public
 */
export const getAllBikes = (req, res) => {
  // Fetch all bikes from database
  db.query("SELECT * FROM bikes", (err, data) => {
    if (err) return res.status(500).json(err);
    // Return array of all bikes
    return res.status(200).json(data);
  });
};

/**
 * Update existing bike details
 * @route PUT /api/bikes/:id
 * @access Admin only
 */
export const updateBike = (req, res) => {
  // Get bike ID from URL parameters
  const { id } = req.params;
  // Extract updated bike details from request body
  const { name, type, price_per_hour, description, image_url, available } = req.body;

  // Use new uploaded file if provided, otherwise keep existing image_url
  const finalImageUrl = req.file ? `/uploads/bikes/${req.file.filename}` : image_url;

  // Update bike record in database
  db.query(
    "UPDATE bikes SET name=?, type=?, price_per_hour=?, description=?, image_url=?, available=? WHERE id=?",
    [name, type, parseFloat(price_per_hour), description, finalImageUrl, available, id],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json("Failed to update bike: " + err.message);
      }
      // Return success message
      return res.status(200).json({ message: "Bike updated successfully" });
    }
  );
};

/**
 * Delete a bike from database
 * @route DELETE /api/bikes/:id
 * @access Admin only
 * @description Deletes bike only if no active rentals exist. Removes rental history before deletion.
 */
export const deleteBike = (req, res) => {
  // Get bike ID from URL parameters
  const { id } = req.params;

  // Validate that ID is provided
  if (!id) {
    return res.status(400).json({ message: "Bike ID is required" });
  }

  // Step 1: Check if bike exists in database
  db.query("SELECT id FROM bikes WHERE id = ?", [id], (err, bike) => {
    if (err) {
      console.error("Bike check error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Return 404 if bike not found
    if (bike.length === 0) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Step 2: Check for active rentals (pending or confirmed status)
    db.query("SELECT id FROM rentals WHERE bike_id = ? AND status IN ('pending', 'confirmed')", [id], (err, rentals) => {
      if (err) {
        console.error("Rental check error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // Block deletion if bike has active rentals
      if (rentals.length > 0) {
        return res.status(400).json({ message: "Cannot delete bike with active rentals" });
      }

      // Step 3: Delete all rental history records for this bike (returned/rejected rentals)
      db.query("DELETE FROM rentals WHERE bike_id = ?", [id], (err) => {
        if (err) {
          console.error("Rental delete error:", err);
          return res.status(500).json({ message: "Failed to delete rental history" });
        }

        // Step 4: Delete the bike itself
        db.query("DELETE FROM bikes WHERE id = ?", [id], (err) => {
          if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ message: "Failed to delete bike: " + err.message });
          }
          // Return success message
          res.status(200).json({ message: "Bike deleted successfully" });
        });
      });
    });
  });
};
