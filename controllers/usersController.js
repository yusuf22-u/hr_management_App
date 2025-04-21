import bcrypt from 'bcrypt';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
import { upload } from '../utils/cloudinary.js';
export const registerUser = async (req, res) => {
  const { employee_id, username, email, password, role } = req.body;
  const profilePic = req.file ? req.file.path : ''; // Cloudinary URL
  console.log('BODY:', req.body);
  if (!employee_id || !username || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const [employeeResults] = await db.query('SELECT * FROM employees WHERE employee_id = ?', [employee_id]);
    if (employeeResults.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee does not exist' });
    }

    const [userResults] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userResults.length > 0) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }

    const [userResultsID] = await db.query('SELECT * FROM users WHERE employee_id = ?', [employee_id]);
    if (userResultsID.length > 0) {
      return res.status(409).json({ success: false, error: 'User with this ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';

    const [result] = await db.query(
      'INSERT INTO users (employee_id, username, email, password, role, profile) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, username, email, hashedPassword, userRole, profilePic]
    );

    const token = jwt.sign(
      {
        userId: result.insertId,
        employee_id,
        role: userRole
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      profile_pic: profilePic
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'All fields are required' });

  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const loginTime = new Date();
    await db.query('UPDATE users SET last_login = ? WHERE id = ?', [loginTime, user.id]);

    const token = jwt.sign({
      userId: user.id,
      employee_id: user.employee_id,
      role: user.role,
      profilePic: user.profile ? `${user.profile}` : null,
      username: user.username
    }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        role: user.role,
        profilePic: user.profile ? `${user.profile}` : null,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
};

export const logoutUser = async (req, res) => {
  const userId = req.user.userId;
  const now = new Date();

  try {
    await db.query('UPDATE users SET last_logout = ? WHERE id = ?', [now, userId]);
  } catch (err) {
    console.error('Failed to update logout time:', err.message);
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getUsers = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'id', order = 'ASC' } = req.query;
  const offset = (page - 1) * limit;

  const validSortColumns = ['id', 'username', 'email', 'role'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'id';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  try {
    const [users] = await db.query(`SELECT * FROM users ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`, [parseInt(limit), parseInt(offset)]);

    if (users.length === 0) return res.status(404).json({ error: "Users not found" });

    res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy: sortColumn,
        order: sortOrder,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: 'Server error', err: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const allowedRoles = ["admin", "user", "award", "manager"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User role updated successfully" });
  } catch (err) {
    res.status(500).json({ error: 'Server error', err: err.message });
  }
};
// Get all users' login/logout history
export const getAllUsersHistory = async (req, res) => {
  const sql = `
        SELECT profile, username, last_login AS lastIn, last_logout AS lastOut
        FROM users
        ORDER BY last_login DESC
    `;

  try {
    const [results] = await db.query(sql);

    if (results.length === 0) {
      return res.status(404).json({ error: "No user history found" });
    }

    res.status(200).json({
      success: true,
      message: "User history retrieved successfully",
      data: results,
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
// Get user info by ID (using ID from token middleware)
export const getUserById = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: No user ID found" });
  }

  const sql = `
        SELECT profile, username, email
        FROM users
        WHERE id = ?
    `;

  try {
    const [results] = await db.query(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: results[0],
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
// Update user account info
export const updateUserAccount = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { username, email } = req.body;
  const newProfile = req.file?.path || null; // Cloudinary returns `path` as the full URL

  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required" });
  }

  try {
    const [results] = await db.query(`SELECT profile FROM users WHERE id = ?`, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    const existingProfile = results[0].profile;
    const finalProfile = newProfile || existingProfile;

    const updateQuery = `
      UPDATE users
      SET username = ?, email = ?, profile = ?
      WHERE id = ?
    `;

    await db.query(updateQuery, [username, email, finalProfile, userId]);

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      profile: finalProfile, // Return the Cloudinary URL
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

