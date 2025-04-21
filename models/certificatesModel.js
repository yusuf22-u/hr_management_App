import db from '../config/db.js';

export const createCertificatesTable = async () => {
    const sql = `
 CREATE TABLE IF NOT EXISTS employee_certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    certificate_name VARCHAR(255) NOT NULL,
    certificate_file TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

   `
        ;

    try {
        await db.query(sql);
        console.log('✅ employee_certificate table created or already exists');
    } catch (err) {
        console.error('❌ Error creating employee_certificate table:', err.message);
    }
};