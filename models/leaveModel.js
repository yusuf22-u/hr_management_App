import db from '../config/db.js';
export const createLeaveTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS leaves (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      leave_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
    );
  `;

  try {
    await db.query(sql);
    console.log('✅ leaves table created or already exists with ON DELETE CASCADE');
  } catch (err) {
    console.error('❌ Error creating leaves table:', err.message);
  }
};
