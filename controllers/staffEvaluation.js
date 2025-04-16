import { validateEvaluation } from '../validation/validation.js';
import db from '../config/db.js';

// Create a Staff Evaluation
export const createStaffEvaluation = (req, res) => {
    // Validate the request body
    const { error } = validateEvaluation(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { employee_id } = req.body;

    // Check if the employee exists
    const checkEmployeeSQL = 'SELECT * FROM employees WHERE employee_id = ?';
    db.query(checkEmployeeSQL, [employee_id], (err, results) => {
        if (err) {
            console.error('Error checking employee:', err);
            return res.status(500).json({ error: 'Server error', details: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Employee ID does not exist' });
        }

        // Insert the staff evaluation
        const insertSQL = `
            INSERT INTO staff_evaluation 
            (employee_id, evaluation_date, evaluator_name, communication_skills, technical_skills, teamwork, problem_solving, punctuality, responsibility, expertise, dependability, reliability, skills, comments) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            employee_id,
            req.body.evaluation_date,
            req.body.evaluator_name,
            req.body.communication_skills,
            req.body.technical_skills,
            req.body.teamwork,
            req.body.problem_solving,
            req.body.punctuality,
            req.body.responsibility,
            req.body.expertise,
            req.body.dependability,
            req.body.reliability,
            req.body.skills,
            req.body.comments
        ];

        db.query(insertSQL, values, (err, result) => {
            if (err) {
                console.error('Error creating staff evaluation:', err);
                return res.status(500).json({ error: 'Server error', details: err });
            }
            res.status(201).json({ success: 'Evaluation created successfully' });
        });
    });
};

// Get All Employee Evaluations
export const getEmployeeEvaluations = (req, res) => {
    const sql = `
        SELECT 
            e.profile_pic, 
            e.full_name, 
            e.position, 
            e.department,
            DATE_FORMAT(e.date_of_birth, '%Y-%m-%d') AS date_of_birth,
            DATE_FORMAT(e.date_of_admission, '%Y-%m-%d') AS date_of_admission,
            DATE_FORMAT(se.evaluation_date, '%Y-%m-%d') AS evaluation_date,
            se.id AS evaluation_id,
            se.evaluator_name, 
            se.communication_skills, 
            se.technical_skills, 
            se.teamwork, 
            se.problem_solving, 
            se.punctuality, 
            se.responsibility,
            se.expertise,
            se.dependability,
            se.reliability,
            se.skills,
            se.overall_performance, 
            se.comments,
            se.created_at
        FROM staff_evaluation se
        JOIN employees e ON se.employee_id = e.employee_id
        ORDER BY se.created_at DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching evaluations:", err);
            return res.status(500).json({ error: "Server error", details: err });
        }
        res.status(200).json(results);
    });
};

// Delete Staff Evaluation
export const deleteStaffEvaluation = (req, res) => {
    const { id } = req.params;

    const deleteSQL = 'DELETE FROM staff_evaluation WHERE id = ?';
    db.query(deleteSQL, [id], (err, result) => {
        if (err) {
            console.error('Error deleting evaluation:', err);
            return res.status(500).json({ error: 'Server error', details: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evaluation not found' });
        }

        res.status(200).json({ success: 'Evaluation deleted successfully' });
    });
};
// employee of the month
export const getStaffOfTheMonth = (req, res) => {
    const sql = `
        SELECT e.employee_id, e.full_name, e.profile_pic, e.position, 
               MAX(se.overall_performance) AS highest_performance, 
               se.evaluation_date
        FROM staff_evaluation se
        JOIN employees e ON se.employee_id = e.employee_id
        WHERE MONTH(se.evaluation_date) = MONTH(CURRENT_DATE())
        AND YEAR(se.evaluation_date) = YEAR(CURRENT_DATE())
        ORDER BY se.overall_performance DESC, se.evaluation_date ASC
        LIMIT 1;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching staff of the month:", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No evaluations this month" });
        }
        res.status(200).json(results[0]);
    });
};

export const getScoreDistribution = (req, res) => {
    const query = `
      SELECT
            SUM(overall_performance > 90) AS above_90,
            SUM(overall_performance BETWEEN 60 AND 90) AS above_60,
            SUM(overall_performance BETWEEN 50 AND 59) AS below_59,
            SUM(overall_performance < 50) AS below_49,
            DATE_FORMAT(NOW(), '%M %Y') AS current_month
        FROM staff_evaluation
        WHERE MONTH(evaluation_date) = MONTH(NOW()) 
        AND YEAR(evaluation_date) = YEAR(NOW());
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
};
//get staff evaluations by ID
export const getEmployeeEvaluationsByID = (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT se.*, e.full_name, e.profile_pic, e.position,e.department 
        FROM staff_evaluation se
        JOIN employees e ON se.employee_id = e.employee_id
        WHERE se.id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Server error", err });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Employee evaluation not found" });
        }

        // Return the evaluation data along with the employee's full name
        return res.status(200).json(result[0]);
    });
};
// evaluation by ID
export const getSingleEmployeeEvaluationByID = (req, res) => {
    const { id } = req.params

    const sql = `
            SELECT 
                e.profile_pic, 
                e.full_name, 
                e.position, 
                e.department,
                DATE_FORMAT(e.date_of_birth, '%Y-%m-%d') AS date_of_birth,
                DATE_FORMAT(e.date_of_admission, '%Y-%m-%d') AS date_of_admission,
                DATE_FORMAT(se.evaluation_date, '%Y-%m-%d') AS evaluation_date,
                se.id AS evaluation_id,
                se.evaluator_name, 
                se.communication_skills, 
                se.technical_skills, 
                se.teamwork, 
                se.problem_solving, 
                se.punctuality, 
                se.responsibility,
                se.expertise,
                se.dependability,
                se.reliability,
                se.skills,
                se.overall_performance, 
                se.comments,
                se.created_at
            FROM staff_evaluation se
            JOIN employees e ON se.employee_id = e.employee_id
            WHERE se.id=?`;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching evaluations:", err);
            return res.status(500).json({ error: "Server error", details: err });
        }
        res.status(200).json(results);
    });

}