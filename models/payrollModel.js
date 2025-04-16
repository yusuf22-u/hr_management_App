import db from '../config/db.js';

// Function to create the users table
export const createPayrollTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS payroll (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    resident_allowance DECIMAL(10, 2) DEFAULT 0,
    responsibility_allowance DECIMAL(10, 2) DEFAULT NULL, -- Only for Executive Director
    transport_allowance DECIMAL(10, 2) DEFAULT 0,
    income_tax DECIMAL(10, 2) NOT NULL,
    social_security_contribution DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) GENERATED ALWAYS AS (
        basic_salary + resident_allowance + COALESCE(responsibility_allowance, 0) + transport_allowance 
        - (income_tax + social_security_contribution)
    ) STORED,
    salary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);


    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('payroll table created or already exists');
    });
};
