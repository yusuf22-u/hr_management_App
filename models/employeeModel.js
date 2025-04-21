import db from '../config/db.js';

export const createEmployeeTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS employees (
      employee_id INT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      address TEXT NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      profile_pic TEXT,
      position VARCHAR(100) NOT NULL,
      department VARCHAR(100) NOT NULL,
      date_of_birth DATE NOT NULL,
      date_of_admission DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(sql);
    console.log('✅ Employee table created or already exists');
  } catch (err) {
    console.error('❌ Error creating employee table:', err.message);
  }
};
