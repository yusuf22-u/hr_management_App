import db from '../config/db.js';

export const createCertificatesTable = () => {
   const sql=`
 CREATE TABLE IF NOT EXISTS employee_certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    certificate_name VARCHAR(255) NOT NULL,
    certificate_file VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

   `
    ;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('certificate table created or already exists');
    });
};