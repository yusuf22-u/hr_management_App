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
    profile VARCHAR(255) DEFAULT 'profile.png',
    role ENUM('admin', 'user', 'award','manager') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    last_logout TIMESTAMP NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('Users table created or already exists');
    });
};
