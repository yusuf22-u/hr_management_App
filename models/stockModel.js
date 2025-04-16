import db from '../config/db.js';

// Function to create the users table
export const createStockTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS stock_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        transactions_type ENUM('stock-in', 'stock-out') NOT NULL,
        quantity INT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('stock_transactions table created or already exists');
    });
};
