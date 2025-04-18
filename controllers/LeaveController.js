import db from "../config/db.js";
import { io } from "../index.js";
export const notifyAdmin = async (employee_id, leave_type, start_date, end_date) => {
  // Fetch admin or manager ID (this might be hardcoded or retrieved from another source)
  const adminId = employee_id; // Example

  const message = `Employee ${employee_id} has requested ${leave_type} leave from ${start_date} to ${end_date}.`;

  const query = `
    INSERT INTO notifications (user_id, message)
    VALUES (?, ?)
  `;

  try {
    await db.query(query, [adminId, message]);
  } catch (err) {
    console.error('Error creating notification', err.message);
  }
};
export const createLeaveRequest = async (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  try {
    // Step 1: Check if the employee exists
    const checkEmployeeQuery = 'SELECT employee_id FROM employees WHERE employee_id = ?';
    const [employeeResults] = await db.query(checkEmployeeQuery, [employee_id]);

    if (employeeResults.length === 0) {
      // Employee does not exist
      return res.status(404).json({ error: 'Employee does not exist' });
    }

    // Step 2: If employee exists, proceed with leave request insertion
    const insertLeaveQuery = `
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(insertLeaveQuery, [employee_id, leave_type, start_date, end_date, reason]);

    // Notify admin or manager
    await notifyAdmin(employee_id, leave_type, start_date, end_date);

    // Emit the notification event via Socket.io
    const message = `Employee ${employee_id} has requested ${leave_type} leave from ${start_date} to ${end_date}.`;
    io.emit('new_notification', { user_id: employee_id, message }); // Send to all connected clients

    res.status(201).json({ message: 'Leave request created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating leave request', details: err.message });
  }
};


export const getLeaveRequests = async (req, res) => {
  const query = `
    SELECT l.id, l.leave_type, l.start_date, l.created_at, l.end_date, l.status, l.reason, e.full_name
    FROM leaves l
    JOIN employees e ON e.employee_id = l.employee_id
  `;

  try {
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching leave requests', details: err.message });
  }
};
export const updateLeaveRequest = async (req, res) => {
  const { id } = req.params; // The leave request ID
  const { status } = req.body; // New leave status (approved/rejected)

  try {
    // Step 1: Update the leave request status
    const updateQuery = 'UPDATE leaves SET status = ? WHERE id = ?';
    const [updateResult] = await db.query(updateQuery, [status, id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Step 2: Fetch leave request details
    const fetchLeaveQuery = `
      SELECT l.employee_id, e.full_name, l.leave_type, l.start_date, l.end_date
      FROM leaves l
      JOIN employees e ON e.employee_id = l.employee_id
      WHERE l.id = ?
    `;
    const [leaveResults] = await db.query(fetchLeaveQuery, [id]);

    if (leaveResults.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leave = leaveResults[0];
    const userId = leave.employee_id;
    const messageText = `Your leave request for ${leave.leave_type} leave from ${leave.start_date} to ${leave.end_date} has been ${status}.`;

    // Step 3: Create a notification
    const insertNotificationQuery = 'INSERT INTO notifications (user_id, message) VALUES (?, ?)';
    await db.query(insertNotificationQuery, [userId, messageText]);

    // Step 4: Create a message
    const insertMessageQuery = 'INSERT INTO message (user_id, message) VALUES (?, ?)';
    await db.query(insertMessageQuery, [userId, messageText]);

    // Step 5: Emit Socket.IO events for real-time notifications and messages
    io.emit('leave_status_update', { user_id: userId, message: messageText });
    io.emit('new_notification', { user_id: userId, message: messageText });

    res.status(200).json({
      message: 'Leave request updated, notification and message sent successfully',
      notification: messageText,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error updating leave request', details: err.message });
  }
};


export const getNotifications = async (req, res) => {
  const query = 'SELECT * FROM notifications';

  try {
    const [results] = await db.query(query);
    res.status(200).json(results); // Return the notifications, including the is_read field
  } catch (err) {
    res.status(500).json({ error: 'Error fetching notifications', details: err.message });
  }
};

//get message
export const getMassage = async (req, res) => {
  const userId = req.user.employee_id;

  try {
    const query = 'SELECT * FROM message WHERE user_id = ? ORDER BY created_at DESC';
    const [results] = await db.query(query, [userId]);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages', details: err.message });
  }
};


// ✅ Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    io.emit('notification_read', { id });
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read', details: err.message });
  }
};

// ✅ Delete a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM notifications WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification', details: err.message });
  }
};

// ✅ Fetch unread user messages
export const notifyUsers = async (req, res) => {
  const userId = req.user.employee_id;

  try {
    const [rows] = await db.query(
      `SELECT * FROM message WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
};

// ✅ Mark a user message as read
export const userMessageAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE message SET is_read = TRUE WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message marked as read successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as read', details: err.message });
  }
};

// ✅ Delete a user message
export const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM message WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message', details: err.message });
  }
};
