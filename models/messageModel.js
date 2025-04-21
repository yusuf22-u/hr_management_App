import db from '../config/db.js'; // adjust the path if needed

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
      FOREIGN KEY (user_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
      FOREIGN KEY (leave_id) REFERENCES leaves(id) ON DELETE CASCADE
    );
  `;

  db.query(sql)
    .then(() => {
      console.log('✅ message table created or already exists');
    })
    .catch((err) => {
      console.error('❌ Failed to create message table:', err.message);
    });
};
