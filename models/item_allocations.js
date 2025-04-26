import db from '../config/db.js';

// Function to create the users table
export const createitem_allocationsTable = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS item_allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        staff_id INT NOT NULL,
        quantity INT NOT NULL,
        allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        returned_at TIMESTAMP NULL,
        is_returned BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

    `;

    
  try {
    await db.query(sql);
    console.log('✅ item_allocations table created or already exists with ON DELETE CASCADE');
  } catch (err) {
    console.error('❌ Error creating item_allocations table:', err.message);
  }
};
