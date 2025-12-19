import { db } from "../config/db.js";
import { calculateDynamicPrice, optimizeAvailability } from "../algorithms/recommendation.js";

// Get all rentals with user and bike details
export const getAllRentals = (req, res) => {
  const query = `
    SELECT r.*, u.full_name as user_name, u.email as user_email, u.license_number,
           b.name as bike_name, b.type as bike_type, 
           b.price_per_hour as bike_price, b.image_url as bike_image
    FROM rentals r 
    JOIN users u ON r.user_id = u.id 
    JOIN bikes b ON r.bike_id = b.id 
    ORDER BY r.rental_date DESC
  `;
  
  db.query(query, (err, data) => {
    if (err) return res.status(500).json("Database error");
    return res.status(200).json(data);
  });
};

// Get rentals for specific user
export const getUserRentals = (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT r.*, b.name as bike_name, b.type as bike_type, 
           b.price_per_hour as bike_price, b.image_url as bike_image
    FROM rentals r 
    JOIN bikes b ON r.bike_id = b.id 
    WHERE r.user_id = ?
    ORDER BY r.rental_date DESC
  `;
  
  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json("Database error");
    return res.status(200).json(data);
  });
};

// Confirm rental (admin only)
export const confirmRental = (req, res) => {
  const { id } = req.params;
  
  // First get the bike_id from the rental
  db.query("SELECT bike_id FROM rentals WHERE id = ?", [id], (err, rentalData) => {
    if (err) return res.status(500).json("Database error");
    if (!rentalData.length) return res.status(404).json("Rental not found");
    
    const bikeId = rentalData[0].bike_id;
    
    // Update rental status to confirmed
    db.query("UPDATE rentals SET status = 'confirmed' WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json("Database error");
      
      // Mark bike as unavailable
      db.query("UPDATE bikes SET available = false WHERE id = ?", [bikeId], (err) => {
        if (err) return res.status(500).json("Failed to update bike status");
        return res.status(200).json("Rental confirmed and bike marked as rented");
      });
    });
  });
};

// Create new rental
export const createRental = (req, res) => {
  const { user_id, bike_id, start_date, end_date, total_price } = req.body;
  
  // Check if user has license
  db.query("SELECT license_number FROM users WHERE id = ?", [user_id], (err, userData) => {
    if (err) return res.status(500).json("Database error");
    if (!userData.length) return res.status(404).json("User not found");
    if (!userData[0].license_number) return res.status(400).json("License number is required for booking");
    
    // Check if bike is available
    db.query("SELECT available FROM bikes WHERE id = ?", [bike_id], (err, bikeData) => {
      if (err) return res.status(500).json("Database error");
      if (!bikeData.length) return res.status(404).json("Bike not found");
      if (!bikeData[0].available) return res.status(400).json("Bike is not available");
      
      // Check if user already has a pending rental for this bike
      db.query(
        "SELECT * FROM rentals WHERE user_id = ? AND bike_id = ? AND status = 'pending'",
        [user_id, bike_id],
        (err, existingRental) => {
          if (err) return res.status(500).json("Database error");
          if (existingRental.length) return res.status(400).json("You already have a pending request for this bike");
          
          // Check availability conflicts
          optimizeAvailability(start_date, end_date, (err, conflicts) => {
            if (err) return res.status(500).json("Database error");
            
            const hasConflict = conflicts.some(c => c.bike_id == bike_id);
            if (hasConflict) {
              return res.status(400).json("Bike not available for selected dates");
            }
            
            // Add date columns if they don't exist
            db.query("ALTER TABLE rentals ADD COLUMN start_date DATE, ADD COLUMN end_date DATE, ADD COLUMN total_price DECIMAL(10,2)", () => {
              // Create rental request
              db.query(
                "INSERT INTO rentals (user_id, bike_id, status, start_date, end_date, total_price) VALUES (?, ?, 'pending', ?, ?, ?)",
                [user_id, bike_id, start_date, end_date, total_price],
                (err, result) => {
                  if (err) return res.status(500).json("Database error");
                  return res.status(201).json({ message: "Rental request created", id: result.insertId });
                }
              );
            });
          });
        }
      );
    });
  });
};

// Return bike (mark as available again)
export const returnBike = (req, res) => {
  const { id } = req.params;
  
  // Get the bike_id from the rental
  db.query("SELECT bike_id FROM rentals WHERE id = ?", [id], (err, rentalData) => {
    if (err) return res.status(500).json("Database error");
    if (!rentalData.length) return res.status(404).json("Rental not found");
    
    const bikeId = rentalData[0].bike_id;
    
    // Update rental status to returned
    db.query("UPDATE rentals SET status = 'returned', return_date = NOW() WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json("Database error");
      
      // Mark bike as available again
      db.query("UPDATE bikes SET available = true WHERE id = ?", [bikeId], (err) => {
        if (err) return res.status(500).json("Failed to update bike status");
        return res.status(200).json("Bike returned successfully");
      });
    });
  });
};

// Cancel rental
export const cancelRental = (req, res) => {
  const { id } = req.params;
  
  db.query("SELECT status FROM rentals WHERE id = ?", [id], (err, data) => {
    if (err) {
      console.error("Cancel rental error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (!data.length) return res.status(404).json({ message: "Rental not found" });
    if (data[0].status !== 'pending') return res.status(400).json({ message: "Can only cancel pending rentals" });
    
    db.query("DELETE FROM rentals WHERE id = ? AND status = 'pending'", [id], (err, result) => {
      if (err) {
        console.error("Cancel delete error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Rental not found" });
      }
      return res.status(200).json({ message: "Rental cancelled successfully" });
    });
  });
};