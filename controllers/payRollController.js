import db from "../config/db.js";

export const createPayRoll = (req, res) => {
    const { 
        employee_id, 
        basic_salary, 
        resident_allowance = 0, 
        responsibility_allowance = 0, 
        transport_allowance = 0, 
        income_tax, 
        social_security_contribution 
    } = req.body;

    // Calculate gross salary
    const gross_salary = basic_salary + resident_allowance + (responsibility_allowance || 0) + transport_allowance;

    // Calculate total deductions
    const total_deductions = income_tax + social_security_contribution;

    // Calculate net salary
    const net_salary = gross_salary - total_deductions;

    // SQL to check if the employee exists
    const checkEmployee = `SELECT employee_id FROM employees WHERE employee_id = ?`;

    // SQL to insert payroll data
    const sql = `INSERT INTO payroll (
                    employee_id, basic_salary, resident_allowance, responsibility_allowance, 
                    transport_allowance, income_tax, social_security_contribution, 
                    net_salary, salary_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`;

    db.query(checkEmployee, [employee_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Server error", details: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Employee does not exist" });
        }

        // Proceed to insert payroll record
        db.query(
            sql, 
            [
                employee_id, basic_salary, resident_allowance, responsibility_allowance, 
                transport_allowance, income_tax, social_security_contribution, 
                 net_salary
            ], 
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to add payroll", details: err });
                }

                return res.status(201).json({ message: "Employee payroll added successfully", result });
            }
        );
    });
};
 
export const getEmployeeSalary = (req, res) => {
    const { employee_id } = req.params;

    // SQL query to get the latest salary record for the employee along with their details
    const sql = `
        SELECT 
            payroll.*,
            employees.full_name,
            employees.profile_pic,
            employees.employee_id,
            employees.department
        FROM payroll
        JOIN employees ON payroll.employee_id = employees.employee_id
        WHERE payroll.employee_id = ?
        ORDER BY payroll.salary_date DESC
        LIMIT 1
    `;

    db.query(sql, [employee_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Server error", details: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "No payroll record found for this employee" });
        }

        return res.status(200).json(result[0]);
    });
};
export const getAllEmployeeSalary = (req, res) => {
    const { limit = 10, offset = 0 } = req.query; // Default limit is 10 and offset is 0
    const countQuery = 'SELECT COUNT(*) AS totalCount FROM  payroll';
    const sql = `
        SELECT 
            payroll.*,
            employees.full_name,
            employees.profile_pic,
            employees.employee_id AS emp_id,
            employees.department
        FROM payroll
        JOIN employees ON payroll.employee_id = employees.employee_id
        LIMIT ? OFFSET ?
    `;
    const totalNetSalaryQuery = 'SELECT SUM(net_salary) AS totalNetSalary FROM payroll';
    db.query(countQuery, (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: 'Database count query error: ' + err });
        }
        const totalCount = countResult[0].totalCount;
        db.query(totalNetSalaryQuery, (err, countResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database count query error: ' + err });
            }
            const totalNetSalary = countResult[0].totalNetSalary;


            db.query(sql, [parseInt(limit), parseInt(offset)], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Server error", details: err });
                }

                if (result.length === 0) {
                    return res.status(404).json({ error: "No payroll record found" });
                }

                return res.status(200).json({
                    result: result,
                    totalCount,
                    totalNetSalary
                });
            });
        })
    })
};

export const deletePayroll = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM payroll WHERE payroll_id = ?`;

    db.query(sql, [id], (err, result) => {  // Corrected the order of callback params
        if (err) {
            return res.status(500).json({ status: false, error: "Query error", err });
        }

        if (result.affectedRows === 0) {  // Check affected rows to see if any row was deleted
            return res.status(404).json({ status: false, error: 'No record found' });
        }

        return res.json({ status: true, msg: "Payroll successfully deleted" });
    });
};
//pay single employee
export const paySingleEmployee = (req, res) => {
    const { id } = req.params
    const sql = `UPDATE payroll SET payment_status = 'Paid' WHERE payroll_id = ? AND MONTH(salary_date) = MONTH(CURDATE())`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "server error", err })
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No unpaid salary found for this employee this month" })
        }
        return res.status(200).json({ message: "Salary marked as Paid for the employee" });
    })
}
// pay all the employees
export const payAllEmployees = (req, res) => {
    const sql = `UPDATE payroll SET payment_status = 'Paid' WHERE payment_status = 'Unpaid' AND MONTH(salary_date) = MONTH(CURDATE())`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: "Server error", details: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No unpaid salaries found" });
        }

        return res.status(200).json({ message: `Paid ${result.affectedRows} employees` });
    });
};
// get all unpaid employee
export const getUnpaidEmployees = (req, res) => {
    const sql = `
        SELECT employees.employee_id, employees.full_name, employees.department
        FROM employees
        LEFT JOIN payroll ON employees.employee_id = payroll.employee_id 
        AND MONTH(payroll.salary_date) = MONTH(CURDATE())
        WHERE payroll.payment_status IS NULL OR payroll.payment_status = 'Unpaid'
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: "Server error", details: err });

        if (result.length === 0) {
            return res.status(200).json({ message: "All employees have been paid" });
        }

        return res.status(200).json({ unpaidEmployees: result });
    });
};
export const getEmailText = (req, res) => {
    const sql = `SELECT * FROM emailtable`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: "server error", err })
        if (result.length < 0) {
            return res.status(404).json({ error: "message not found" })
        }
        return res.status(200).json(result)
    })
}