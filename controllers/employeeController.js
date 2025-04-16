import db from '../config/db.js'; // Adjust the path according to your project structure
export const createEmployee = (req, res) => {
  const { employee_id, full_name, email, address, phone_number, position, department, date_of_birth, date_of_admission } = req.body;
  const profile_pic = req.file ? req.file.filename : null;

  // Check if employee_id or email already exists
  const checkDuplicateQuery = `
    SELECT * FROM employees WHERE employee_id = ? OR email = ?
  `;

  db.query(checkDuplicateQuery, [employee_id, email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err });
    }

    // If a record with the same employee_id or email is found, return an error
    if (results.length > 0) {
      const existing = results[0];
      if (existing.employee_id === parseInt(employee_id)) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      } else if (existing.email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Proceed with the insertion if no duplicates
    const insertEmployeeQuery = `
      INSERT INTO employees (employee_id, full_name, email, address, phone_number, profile_pic, position, department, date_of_birth, date_of_admission)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertEmployeeQuery, [employee_id, full_name, email, address, phone_number, profile_pic, position, department,  date_of_birth, date_of_admission], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error: ' + err });
      }
      res.json({ message: 'Employee created successfully' });
    });
  });
};

export const getEmployeeById = (req, res) => {
  const { employee_id } = req.params;

  const query = 'SELECT * FROM employees WHERE employee_id = ?';
  db.query(query, [employee_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching employee data', error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.status(200).json(result[0]); // Return the employee data
  });
};
export const updateEmployee = (req, res) => {
  const { employee_id } = req.params;
  const { full_name, email, address, phone_number, position, department, date_of_birth, date_of_admission } = req.body;

  // Query to fetch existing profile picture
  const getExistingProfilePicQuery = 'SELECT profile_pic FROM employees WHERE employee_id = ?';

  db.query(getExistingProfilePicQuery, [employee_id], (err, results) => {
    if (err) {
      console.error('Database query error while fetching existing profile pic:', err);
      return res.status(500).json({ status: false, error: 'Database query error: ' + err });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: false, error: 'Employee not found' });
    }

    const existingProfilePic = results[0].profile_pic;
    console.log('Existing profile pic:', existingProfilePic);

    // Determine the profile_pic value
    let profile_pic = existingProfilePic; // Default to existing profile pic
    if (req.file) {
      profile_pic = req.file.filename; // Update with new file if provided
      console.log('New profile pic:', profile_pic);
    }

    // Query to update employee information
    const updateQuery = `
      UPDATE employees SET 
        full_name = ?, 
        email = ?, 
        address = ?, 
        phone_number = ?, 
        position = ?, 
        department = ?, 
        date_of_birth = ?, 
        date_of_admission = ?,
        profile_pic = ?  -- Include profile_pic in the update query
      WHERE employee_id = ?
    `;

    db.query(updateQuery, [full_name, email, address, phone_number, position, department, date_of_birth, date_of_admission, profile_pic, employee_id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.status(200).json({ message: 'Employee updated successfully' });
    });
  });
};

export const deleteEmployee = (req, res) => {
  const { employee_id } = req.params;

  const sql = 'DELETE FROM employees WHERE employee_id = ?';

  db.query(sql, [employee_id], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, error: 'Query error: ' + err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, error: 'No record found' });
    }
    return res.json({ status: true, message: 'Employee successfully deleted' });
  });
};




// Controller method to get all employees
export const getAllEmployees = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) AS totalCount FROM employees';
  const employeeQuery = 'SELECT * FROM employees LIMIT ? OFFSET ?';
  const query = 'SELECT * FROM employees';
  db.query(countQuery, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database count query error: ' + err });
    }
    const totalCount = countResult[0].totalCount;
    db.query(employeeQuery, [limit, offset], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error: ' + err });
      }
      res.json({
        totalCount,
        employees: results
      });
    });
});
};
// Controller method to get employee distribution by department
export const getEmployeeDistribution = (req, res) => {
  const query = `
    SELECT department, COUNT(*) AS count
    FROM employees
    GROUP BY department
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err });
    }
    res.json(results);
  });
};
