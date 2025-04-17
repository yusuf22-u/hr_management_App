import db from '../config/db.js';
export const createMessageTable = () => {
    const sql = `
   CREATE TABLE IF NOT EXISTS message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,  
    leave_id INT, 
    status ENUM('approved', 'rejected') NOT NULL, 
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES employees(employee_id),  
    FOREIGN KEY (leave_id) REFERENCES leaves(id)
);



    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(' message table created or already exists');
    });
};
