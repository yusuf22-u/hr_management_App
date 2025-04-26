import db from '../config/db.js';

// Function to create the users table
export const createItemsTable = async () => {
  const sql = `
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_number VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  physical_location VARCHAR(255),
  amount DECIMAL(10, 2),
  acquisition_date DATE,  
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `;


  try {
    await db.query(sql);
    console.log('✅ item table created or already exists with ON DELETE CASCADE');
  } catch (err) {
    console.error('❌ Error creating item table:', err.message);
  }
};
