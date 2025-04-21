import db from "../config/db.js";
export const createPayRoll = async (req, res) => {
    const { 
        employee_id, 
        basic_salary, 
        resident_allowance = 0, 
        responsibility_allowance = 0, 
        transport_allowance = 0, 
        income_tax, 
        social_security_contribution 
    } = req.body;

    try {
        // Check if employee exists
        const [employee] = await db.query(
            `SELECT employee_id FROM employees WHERE employee_id = ?`,
            [employee_id]
        );

        if (employee.length === 0) {
            return res.status(404).json({ error: "Employee does not exist" });
        }

        // Check if payroll already exists for this employee in the current month
        const [existingPayroll] = await db.query(
            `SELECT * FROM payroll 
             WHERE employee_id = ? 
             AND MONTH(salary_date) = MONTH(CURDATE()) 
             AND YEAR(salary_date) = YEAR(CURDATE())`,
            [employee_id]
        );

        if (existingPayroll.length > 0) {
            return res.status(400).json({ error: "Payroll for this employee has already been added this month" });
        }

        // Insert payroll
        const sql = `INSERT INTO payroll (
                        employee_id, basic_salary, resident_allowance, responsibility_allowance, 
                        transport_allowance, income_tax, social_security_contribution, 
                        salary_date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`;

        const [result] = await db.query(sql, [
            employee_id, basic_salary, resident_allowance, responsibility_allowance,
            transport_allowance, income_tax, social_security_contribution
        ]);

        // Optionally calculate net_salary and return it
        const net_salary = basic_salary + resident_allowance + responsibility_allowance + transport_allowance
            - (income_tax + social_security_contribution);

        res.status(201).json({ 
            message: "Employee payroll added successfully", 
            result,
            net_salary 
        });

    } catch (err) {
        res.status(500).json({ error: "Server error", err });
        console.error("error",  err)
    }
};

export const getEmployeeSalary = async (req, res) => {
    const { employee_id } = req.params;

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

    try {
        const [result] = await db.query(sql, [employee_id]);

        if (result.length === 0) {
            return res.status(404).json({ error: "No payroll record found for this employee" });
        }

        res.status(200).json(result[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err });
    }
};

export const getAllEmployeeSalary = async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;

    try {
        const [[{ totalCount }]] = await db.query(`SELECT COUNT(*) AS totalCount FROM payroll`);
        const [[{ totalNetSalary }]] = await db.query(`SELECT SUM(net_salary) AS totalNetSalary FROM payroll`);

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

        const [result] = await db.query(sql, [parseInt(limit), parseInt(offset)]);

        if (result.length === 0) {
            return res.status(404).json({ error: "No payroll record found" });
        }

        res.status(200).json({ result, totalCount, totalNetSalary });

    } catch (err) {
        res.status(500).json({ error: "Server error", details: err });
    }
};

export const deletePayroll = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query(`DELETE FROM payroll WHERE payroll_id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, error: 'No record found' });
        }

        res.json({ status: true, msg: "Payroll successfully deleted" });
    } catch (err) {
        res.status(500).json({ status: false, error: "Query error", err });
    }
};

export const paySingleEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query(
            `UPDATE payroll SET payment_status = 'Paid' 
             WHERE payroll_id = ? AND MONTH(salary_date) = MONTH(CURDATE())`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No unpaid salary found for this employee this month" });
        }

        res.status(200).json({ message: "Salary marked as Paid for the employee" });

    } catch (err) {
        res.status(500).json({ error: "Server error", err });
    }
};

export const payAllEmployees = async (req, res) => {
    try {
        const [result] = await db.query(`
            UPDATE payroll 
            SET payment_status = 'Paid' 
            WHERE payment_status = 'Unpaid' AND MONTH(salary_date) = MONTH(CURDATE())
        `);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No unpaid salaries found" });
        }

        res.status(200).json({ message: `Paid ${result.affectedRows} employees` });

    } catch (err) {
        res.status(500).json({ error: "Server error", details: err });
    }
};

export const getUnpaidEmployees = async (req, res) => {
    const sql = `
        SELECT employees.employee_id, employees.full_name, employees.department
        FROM employees
        LEFT JOIN payroll ON employees.employee_id = payroll.employee_id 
        AND MONTH(payroll.salary_date) = MONTH(CURDATE())
        WHERE payroll.payment_status IS NULL OR payroll.payment_status = 'Unpaid'
    `;

    try {
        const [result] = await db.query(sql);

        if (result.length === 0) {
            return res.status(200).json({ message: "All employees have been paid" });
        }

        res.status(200).json({ unpaidEmployees: result });

    } catch (err) {
        res.status(500).json({ error: "Server error", details: err });
    }
};

export const getEmailText = async (req, res) => {
    try {
        const [result] = await db.query(`SELECT * FROM emailtable`);

        if (result.length === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ error: "Server error", err });
    }
};
