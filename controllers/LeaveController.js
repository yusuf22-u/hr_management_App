import db from "../config/db.js";
import { io } from "../index.js";
export const notifyAdmin = (employee_id, leave_type, start_date, end_date) => {
  // Fetch admin or manager ID (this might be hardcoded or retrieved from another source)
  const adminId = employee_id; // Example

  const message = `Employee ${employee_id} has requested ${leave_type} leave from ${start_date} to ${end_date}.`;

  const query = `
    INSERT INTO notifications (user_id, message)
    VALUES (?, ?)
  `;

  db.query(query, [adminId, message], (err, result) => {
    if (err) {
      console.error('Error creating notification', err.message);
    }
  });
};
export const createLeaveRequest = (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  // Step 1: Check if the employee exists
  const checkEmployeeQuery = 'SELECT employee_id FROM employees WHERE employee_id = ?';

  db.query(checkEmployeeQuery, [employee_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking employee existence', details: err.message });
    }

    if (results.length === 0) {
      // Employee does not exist
      return res.status(404).json({ error: 'Employee does not exist' });
    }

    // Step 2: If employee exists, proceed with leave request insertion
    const insertLeaveQuery = `
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertLeaveQuery, [employee_id, leave_type, start_date, end_date, reason], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating leave request', details: err.message });
      }

      // Notify admin or manager
      notifyAdmin(employee_id, leave_type, start_date, end_date);
      // Emit the notification event via Socket.io
      const message = `Employee ${employee_id} has requested ${leave_type} leave from ${start_date} to ${end_date}.`;
      io.emit('new_notification', { user_id: employee_id, message }); // Send to all connected clients

      res.status(201).json({ message: 'Leave request created successfully' });
    });
  });
};



export const getLeaveRequests = (req, res) => {
  const query = `
    SELECT l.id, l.leave_type, l.start_date,l.created_at, l.end_date,l.status, l.reason, e.full_name
    FROM leaves l
    JOIN employees e ON e.employee_id = l.employee_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching leave requests', details: err.message });
    }

    res.status(200).json(results);
  });
};
export const updateLeaveRequest = (req, res) => {
  const { id } = req.params; // The leave request ID
  const { status } = req.body; // New leave status (approved/rejected)

  // Step 1: Update the leave request status
  const query = `
    UPDATE leaves
    SET status = ?
    WHERE id = ?
  `;

  db.query(query, [status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating leave request', details: err.message });
    }

    // Step 2: Fetch leave request details
    const fetchLeaveQuery = `
      SELECT l.employee_id, e.full_name, l.leave_type, l.start_date, l.end_date
      FROM leaves l
      JOIN employees e ON e.employee_id = l.employee_id
      WHERE l.id = ?
    `;

    db.query(fetchLeaveQuery, [id], (err, leaveResults) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching leave details', details: err.message });
      }

      if (leaveResults.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      const leave = leaveResults[0];
      const userId = leave.employee_id;
      const messageText = `Your leave request for ${leave.leave_type} leave from ${leave.start_date} to ${leave.end_date} has been ${status}.`;

      // Step 3: Create a notification
      const insertNotificationQuery = `
        INSERT INTO notifications (user_id, message)
        VALUES (?, ?)
      `;

      db.query(insertNotificationQuery, [userId, messageText], (err, notificationResult) => {
        if (err) {
          return res.status(500).json({ error: 'Error creating notification', details: err.message });
        }

        // Step 4: Create a message
        const insertMessageQuery = `
          INSERT INTO message (user_id, message)
          VALUES (?, ?)
        `;

        db.query(insertMessageQuery, [userId, messageText], (err, messageResult) => {
          if (err) {
            return res.status(500).json({ error: 'Error creating message', details: err.message });
          }

          // Step 5: Emit Socket.IO events for real-time notifications and messages
          io.emit('leave_status_update', { user_id: userId, message: messageText });
          io.emit('new_notification', { user_id: userId, message: messageText });

          res.status(200).json({
            message: 'Leave request updated, notification and message sent successfully',
            notification: messageText,
          });
        });
      });
    });
  });
};


export const getNotifications = (req, res) => {

  // SQL query to fetch notifications with their read status
  const query = 'SELECT * FROM notifications';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching notifications', details: err.message });
    }

    res.status(200).json(results); // Return the notifications, including the is_read field
  });
};
//get message
export const getMassage = (req, res) => {
  const userId = req.user.employee_id;
  console.log('user', userId) // Get userId from the authenticated token

  // SQL query to fetch notifications for the specific user
  const query = `
    SELECT * FROM message WHERE user_id = ? ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching notifications' });
    }
    res.status(200).json(results); // Return only the notifications for the logged-in user
  });

};


// Controller function to mark notification as read
export const markNotificationAsRead = (req, res) => {
  const { id } = req.params;

  // SQL query to update the notification's read status
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ?
  `;

  // Execute the query
  db.query(query, [id], (err, result) => {
    if (err) {
      // Handle any errors that occur during the update
      return res.status(500).json({ error: 'Error marking notification as read', details: err.message });
    }
    io.emit('notification_read', { id });
    // Send a success response once the notification is marked as read
    res.status(200).json({ message: 'Notification marked as read' });
  });
};

export const deleteNotification = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM notifications WHERE id=?'
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ Status: false, error: "query error" })
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, error: 'no record found' });
    }
    return res.json({ Status: true, msg: "notifications is successfully deleted" })
  })
}
//sent notification response to user
export const notifyUsers = (req, res) => {
  const userId = req.user.employee_id;
  console.log('USER', userId)
  const query = `SELECT * FROM message WHERE user_id = ? AND is_read = false`;
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "server error", err })
    }
    res.status(200).json(result)
  })
}
export const userMessageAsRead = (req, res) => {
  const {id}=req.params
 
  console.log('messaID',id)
  const updateMessageQuery = `UPDATE message SET is_read = TRUE WHERE id = ?`;

  db.query(updateMessageQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Server error', details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found or not updated' });
    }

    res.status(200).json({ success: 'Message marked as read successfully' });
  });
};
//delete users message
export const deleteMessage = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM message WHERE id=?'
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ Status: false, error: "query error" + err })
    }
    if (result.length === 0) {
      return res.status(404).json({ status: false, error: 'no record found' });
    }
    return res.json({ Status: true, msg: "Message is successfully deleted" })
  })
}