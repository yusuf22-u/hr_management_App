import db from '../config/db.js';

// Function to create the users table
export const createItemsTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category  VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          description TEXT,
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          

        );
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('items table created or already exists');
    });
};
