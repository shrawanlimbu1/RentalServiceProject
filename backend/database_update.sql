-- Add new columns to users table for profile information
ALTER TABLE users 
ADD COLUMN phone VARCHAR(20),
ADD COLUMN license_number VARCHAR(50),
ADD COLUMN address TEXT;