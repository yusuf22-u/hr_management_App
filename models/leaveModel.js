import db from '../config/db.js';

// Function to create the users table
export const createLeaveTable = () => {
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
          FOREIGN KEY (employee_id) REFERENCES employees(employee_id)


        );
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('leaves table created or already exists');
    });
};
export const Leave = {
    createLeave: (employee_id, leave_type, start_date, end_date, callback) => {
      const sql = 'INSERT INTO leaves (employee_id, leave_type, start_date, end_date) VALUES (?, ?, ?, ?)';
      db.query(sql, [employee_id, leave_type, start_date, end_date], callback);
    },
    
    getLeaveRequests: (callback) => {
      const sql = `
        SELECT 
          leaves.id, 
          employees.full_name, 
          leaves.leave_type, 
          leaves.start_date, 
          leaves.end_date, 
          leaves.status, 
          leaves.created_at, 
          leaves.updated_at
        FROM 
          leaves
        JOIN 
          employees ON leaves.employee_id = employees.id
      `;
      db.query(sql, callback);
    },
    
    
    
  
    updateLeaveStatus: (id, status, callback) => {
      const sql = 'UPDATE leaves SET status = ? WHERE id = ?';
      db.query(sql, [status, id], callback);
    }
    
  };