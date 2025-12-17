-- Create rentals table for tracking bike rentals
CREATE TABLE IF NOT EXISTS rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bike_id INT NOT NULL,
  rental_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  return_date TIMESTAMP NULL,
  status ENUM('pending', 'confirmed', 'returned') DEFAULT 'pending',
  total_cost DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (bike_id) REFERENCES bikes(id)
);

-- Add image upload field to bikes table (if not exists)
ALTER TABLE bikes ADD COLUMN IF NOT EXISTS image_file VARCHAR(255) NULL;