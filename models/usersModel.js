import db from '../config/db.js';

// Function to create the users table
export const createUserTable = () => {
    const sql = `
   CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile TEXT,
    role ENUM('admin', 'user', 'award','manager') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    last_logout TIMESTAMP NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

    `;

    db.query(sql)
    .then(() => {
      console.log('✅ USERS table created or already exists');
    })
    .catch((err) => {
      console.error('❌ Failed to create USERS table:', err.message);
    });
};
