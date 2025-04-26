import db from '../config/db.js';

// Function to create the users table
export const createStockTable =async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS stock_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_number VARCHAR(100),
        transactions_type ENUM('stock-in', 'stock-out') NOT NULL,
        quantity INT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ( item_number) REFERENCES items( item_number) ON DELETE CASCADE
);

    `;

    
      try {
        await db.query(sql);
        console.log('✅ stock table created or already exists with ON DELETE CASCADE');
      } catch (err) {
        console.error('❌ Error creating stock table:', err.message);
      }
};
