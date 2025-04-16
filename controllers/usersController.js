import bcrypt from 'bcrypt';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import multer from 'multer';
dotenv.config()

// Add this in your environment or hardcode it, but it's safer in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/userpic'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and JPG formats are allowed'));
        }
    }
}).single('profile'); // Handling single file upload

export const registerUser = (req, res) => {
  upload(req, res, (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ success: false, error: uploadErr.message });
    }

    const { employee_id, username, email, password, role } = req.body;
    // const profilePic = req.file ? req.file.filename : null;
    const  profilePic = req.file ? req.file.filename : 'profile.png';
 // Save the file name if uploaded

    // Check for missing fields
    if (!employee_id || !username || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
      // Step 1: Verify if the employee exists
      const checkEmployeeSql = `SELECT * FROM employees WHERE employee_id = ?`;
      db.query(checkEmployeeSql, [employee_id], (err, employeeResults) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database query error: ' + err });
        }

        if (employeeResults.length === 0) {
          return res.status(404).json({ success: false, error: 'Employee does not exist' });
        }

        // Step 2: Check if the user already exists
        const checkUserSql = `SELECT * FROM users WHERE email = ?`;
        db.query(checkUserSql, [email], async (err, userResults) => {
          if (err) {
            return res.status(500).json({ success: false, error: 'Database query error: ' + err });
          }

          if (userResults.length > 0) {
            return res.status(409).json({ success: false, error: 'User already exists' });
          }

          try {
            // Step 3: Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Default to 'user' if no role is provided
            const userRole = role ? role : 'user';

            // Step 4: Insert the new user into the database
            const sql = `INSERT INTO users (employee_id, username, email, password, role, profile) VALUES (?, ?, ?, ?, ?, ?)`;
            const values = [employee_id, username, email, hashedPassword, userRole, profilePic];

            db.query(sql, values, (err, result) => {
              if (err) {
                return res.status(500).json({ success: false, error: 'Database insertion error: ' + err });
              }

              // Step 5: Generate JWT token for the user with employee_id in the payload
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
                profile_pic: profilePic ? `/uploads/userpic/${profilePic}` : null
              });
            });
          } catch (hashError) {
            return res.status(500).json({ success: false, error: 'Error hashing password: ' + hashError });
          }
        });
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error: ' + error });
    }
  });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
      if (err) {
          return res.status(500).json({ success: false, error: 'Database query error: ' + err });
      }

      if (results.length === 0) {
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const user = results[0];

      // Check the password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      // Update last login time
      const loginTime = new Date();
      const updateLoginSql = 'UPDATE users SET last_login = ? WHERE id = ?';
      db.query(updateLoginSql, [loginTime, user.id], (updateErr) => {
          if (updateErr) {
              console.error('Failed to update login time:', updateErr);
              // Continue even if the login time update fails
          }

          // Generate a JWT token with employee_id and profile_pic in the payload
          const token = jwt.sign(
              {
                  userId: user.id,
                  employee_id: user.employee_id,
                  role: user.role,
                  profilePic: user.profile ? `/uploads/userpic/${user.profile}` : null, // Send full path
                  username: user.username
              },
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
          );

          // Send token in a secure cookie
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
                  profilePic: user.profile ? `/uploads/userpic/${user.profile}` : null, // Full URL for frontend
                  username: user.username,
                  email: user.email
              }
          });
      });
  });
};

export const logoutUser = (req, res) => {
    const userId = req.user.userId; // Extracted from the decoded JWT
    console.log('User logging out:', userId);
    const now = new Date();

    // Update last logout time
    const updateLogoutSql = 'UPDATE users SET last_logout = ? WHERE id = ?';
    db.query(updateLogoutSql, [now, userId], (err) => {
        if (err) {
            console.error('Failed to update logout time:', err);
            // Continue even if updating logout time fails
        }
    });

    // Clear the JWT token cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getUsers = (req, res) => {
    // Get query parameters for pagination and ordering
    const { page = 1, limit = 10, sortBy = 'id', order = 'ASC' } = req.query; // Defaults: page 1, 10 users per page, sort by id ascending

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Ensure safe ordering
    const validSortColumns = ['id', 'username', 'email', 'role']; // Adjust based on your `users` table columns
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'id'; // Default to `id` if `sortBy` is invalid
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // Default to `ASC` if invalid

    // SQL query with LIMIT and OFFSET for pagination
    const sql = `SELECT * FROM users ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;

    // Execute query
    db.query(sql, [parseInt(limit), parseInt(offset)], (err, result) => {
        if (err) {
            console.error('Database Error:', err); // Log detailed error
            return res.status(500).json({ error: 'Server error', details: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Users not found" });
        }

        // Return users with pagination metadata
        res.status(200).json({
            message: "Users retrieved successfully",
            data: result,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy: sortColumn,
                order: sortOrder,
            },
        });
    });
};


export const deleteUser = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM users WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Server error', err });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    });
};
export const updateUserRole = (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Allowed roles for validation
    const allowedRoles = ["admin", "user", "award","manager"];

    // Validate role and ID
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }
    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    // SQL query
    const sql = `UPDATE users SET role = ? WHERE id = ?`;

    // Execute query
    db.query(sql, [role, id], (err, result) => {
        if (err) {
            console.error("Database error:", err); // Log the error
            return res.status(500).json({ error: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User doesn't exist" });
        }

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
        });
    });
};
export const getAllUsersHistory = (req, res) => {
    const sql = `SELECT profile, username, last_login AS lastIn, last_logout AS lastOut FROM users ORDER BY last_login DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database Error:', err); // Log detailed error
            return res.status(500).json({ error: 'Server error', details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No user history found" });
        }

        // Return all users' login/logout history
        res.status(200).json({
            success: true,
            message: "User history retrieved successfully",
            data: results
        });
    });
};

// get users by Id
export const getUserById = (req, res) => {
    // console.log("User object from token:", req.user); // Debugging log

    const userId = req.user?.userId; // Ensure req.user exis
    
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    const sql = 'SELECT profile, username, email FROM users WHERE id = ?';
    
    db.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Server error", details: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(result[0]);
    });
};
//update user account
export const updateUserAccount = (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const { username, email } = req.body; // Extract data from request body
    const profile = req.file ? req.file.filename : null; // Check if a new profile image is uploaded

    if (!username || !email) {
        return res.status(400).json({ error: "Username and email are required" });
    }

    // First, fetch the current profile image from the database
    const getUserQuery = `SELECT profile FROM users WHERE id = ?`;

    db.query(getUserQuery, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User doesn't exist" });
        }

        // Maintain the current profile picture if no new one is uploaded
        const existingProfile = results[0].profile;
        const finalProfile = profile || existingProfile;

        // Now update the user
        const updateQuery = `UPDATE users SET username = ?, email = ?, profile = ? WHERE id = ?`;
        db.query(updateQuery, [username, email, finalProfile, userId], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Database error:", updateErr);
                return res.status(500).json({ error: "Server error" });
            }

            res.status(200).json({
                success: true,
                message: "Account updated successfully",
                profile: finalProfile,
            });
        });
    });
};
