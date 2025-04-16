import db from '../config/db.js';
export const createnotificationsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES employees(employee_id)
);


    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(' notifications table created or already exists');
    });
};
