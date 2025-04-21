import db from '../config/db.js';
import { cloudinary } from '../utils/cloudinary.js';
export const createEmployee = async (req, res) => {
  const {
    employee_id,
    full_name,
    email,
    address,
    phone_number,
    position,
    department,
    date_of_birth,
    date_of_admission
  } = req.body;

  const profile_pic = req.file ? req.file.path : null; // Cloudinary gives full URL

  try {
    const [existing] = await db.query(
      'SELECT * FROM employees WHERE employee_id = ? OR email = ?',
      [employee_id, email]
    );

    if (existing.length > 0) {
      const found = existing[0];
      if (found.employee_id === parseInt(employee_id)) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }
      if (found.email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    await db.query(
      `INSERT INTO employees 
        (employee_id, full_name, email, address, phone_number, profile_pic, position, department, date_of_birth, date_of_admission)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        full_name,
        email,
        address,
        phone_number,
        profile_pic, // This is a Cloudinary URL
        position,
        department,
        date_of_birth,
        date_of_admission
      ]
    );

    res.status(201).json({ message: 'Employee created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};


export const getEmployeeById = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee', error: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  const { employee_id } = req.params;
  const {
    full_name,
    email,
    address,
    phone_number,
    position,
    department,
    date_of_birth,
    date_of_admission
  } = req.body;

  try {
    const [existingRows] = await db.query(
      'SELECT profile_pic FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let profile_pic = existingRows[0].profile_pic;

    // Upload new image and get secure_url
    if (req.file && req.file.path) {
      // Optional: delete old image from cloudinary if you want
      const oldPublicId = profile_pic?.split('/').pop().split('.')[0]; // crude way to extract public_id
      if (oldPublicId) {
        await cloudinary.uploader.destroy(`employee_profiles/${oldPublicId}`);
      }

      profile_pic = req.file.path; // Cloudinary returns the URL as `path`
    }

    const [result] = await db.query(
      `UPDATE employees SET 
        full_name = ?, 
        email = ?, 
        address = ?, 
        phone_number = ?, 
        position = ?, 
        department = ?, 
        date_of_birth = ?, 
        date_of_admission = ?, 
        profile_pic = ?
      WHERE employee_id = ?`,
      [
        full_name,
        email,
        address,
        phone_number,
        position,
        department,
        date_of_birth,
        date_of_admission,
        profile_pic,
        employee_id
      ]
    );

    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Update error: ' + err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { employee_id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No employee found to delete' });
    }

    res.json({ message: 'Employee successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete error: ' + err.message });
  }
};

export const getAllEmployees = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [[{ totalCount }]] = await db.query('SELECT COUNT(*) AS totalCount FROM employees');

    const [employees] = await db.query(
      'SELECT * FROM employees LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.json({
      totalCount,
      employees
    });
  } catch (err) {
    res.status(500).json({ error: 'Fetch error: ' + err.message });
  }
};

export const getEmployeeDistribution = async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT department, COUNT(*) AS count
       FROM employees
       GROUP BY department`
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Distribution query error: ' + err.message });
  }
};
