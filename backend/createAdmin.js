import bcrypt from 'bcryptjs';
import { db } from './config/db.js';

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  db.query(
    "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
    ['Admin User', 'admin@rental.com', hashedPassword, 'admin'],
    (err) => {
      if (err) {
        console.log('Error:', err);
      } else {
        console.log('Admin user created successfully!');
        console.log('Email: admin@rental.com');
        console.log('Password: admin123');
      }
      process.exit();
    }
  );
};

createAdmin();
