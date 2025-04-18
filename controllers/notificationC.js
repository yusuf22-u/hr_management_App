import db from "../config/db.js";

// Notify admin about the leave request
export const notifyAdmin = async (employee_id, leave_type, start_date, end_date) => {
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

// Create a leave request
export const createLeaveRequest = async (req, res) => {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    try {
        // Step 1: Check if the employee exists
        const checkEmployeeQuery = 'SELECT employee_id FROM employees WHERE employee_id = ?';
        const [employeeCheckResults] = await db.query(checkEmployeeQuery, [employee_id]);

        if (employeeCheckResults.length === 0) {
            return res.status(404).json({ error: 'Employee does not exist' });
        }

        // Step 2: Insert leave request if employee exists
        const insertLeaveQuery = `
          INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason)
          VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(insertLeaveQuery, [employee_id, leave_type, start_date, end_date, reason]);

        // Notify admin
        await notifyAdmin(employee_id, leave_type, start_date, end_date);

        // Emit the notification event via Socket.io
        const message = `Employee ${employee_id} has requested ${leave_type} leave from ${start_date} to ${end_date}.`;
        io.emit('new_notification', { user_id: employee_id, message });

        res.status(201).json({ message: 'Leave request created successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating leave request', details: err.message });
    }
};

// Get all leave requests
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
        return res.status(500).json({ error: 'Error fetching leave requests', details: err.message });
    }
};

// Update leave request status
export const updateLeaveRequest = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Step 1: Update the leave request status
        const query = `
          UPDATE leaves
          SET status = ?
          WHERE id = ?
        `;
        await db.query(query, [status, id]);

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

        // Step 4: Create a message notification
        const insertMessageQuery = `
            INSERT INTO message (user_id, message)
            VALUES (?, ?)
          `;
        await db.query(insertMessageQuery, [userId, messageText]);

        // Step 5: Emit Socket.IO events for real-time notifications and messages
        io.emit('leave_status_update', { user_id: userId, message: messageText });
        io.emit('new_notification', { user_id: userId, message: messageText });

        res.status(200).json({
            message: 'Leave request updated, notification and message sent successfully',
            notification: messageText,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating leave request', details: err.message });
    }
};

// Get all notifications
export const getNotifications = async (req, res) => {
    const query = 'SELECT * FROM notifications';

    try {
        const [results] = await db.query(query);
        res.status(200).json(results); // Return the notifications, including the is_read field
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching notifications', details: err.message });
    }
};

// Get messages for the user
export const getMassage = async (req, res) => {
    const userId = req.user.employee_id;

    const query = `
      SELECT * FROM message WHERE user_id = ? ORDER BY created_at DESC
    `;

    try {
        const [results] = await db.query(query, [userId]);
        res.status(200).json(results); // Return only the notifications for the logged-in user
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching messages', details: err.message });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    const { id } = req.params;

    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
    `;

    try {
        await db.query(query, [id]);
        io.emit('notification_read', { id });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (err) {
        return res.status(500).json({ error: 'Error marking notification as read', details: err.message });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM notifications WHERE id = ?';

    try {
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, error: 'No record found' });
        }
        res.json({ Status: true, msg: 'Notification is successfully deleted' });
    } catch (err) {
        return res.status(500).json({ Status: false, error: 'Query error: ' + err.message });
    }
};

// Get notifications for the user
export const notifyUsers = async (req, res) => {
    const userId = req.user.employee_id;

    const query = `SELECT * FROM message WHERE user_id = ? AND is_read = false`;

    try {
        const [results] = await db.query(query, [userId]);
        res.status(200).json(results);
    } catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Mark user message as read
export const userMessageAsRead = async (req, res) => {
    const { id } = req.params;

    const updateMessageQuery = `UPDATE message SET is_read = TRUE WHERE id = ?`;

    try {
        const [result] = await db.query(updateMessageQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found or not updated' });
        }

        res.status(200).json({ success: 'Message marked as read successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Delete user message
export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM message WHERE id = ?';

    try {
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, error: 'No record found' });
        }

        res.json({ Status: true, msg: 'Message is successfully deleted' });
    } catch (err) {
        return res.status(500).json({ Status: false, error: 'Query error: ' + err.message });
    }
};
