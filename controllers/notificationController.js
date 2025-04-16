import db from "../config/db.js";



export const markNotificationRead = (req, res) => {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    console.log('Notification ID:', notificationId);
    console.log('Employee ID:', userId);
    const query = `
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = ? AND employee_id = ?`;

    db.query(query, [notificationId, userId], (err, results) => {
        if (err) {
            console.error('Error updating notification:', err);
            return res.status(500).json({ error: 'Failed to mark notification as read' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Notification not found or already marked as read' });
        }

        res.json({ message: 'Notification marked as read' });
    });
}
export const notificationMessage = (req, res) => {
    let { page, limit } = req.query;
    // Convert parameters to integers with default values
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10; // Default to 10 records per page
    const offset = (page - 1) * limit;

    // Query to get employees with pagination
    const query = `SELECT * FROM notifications WHERE status="pending" LIMIT ? OFFSET ?`;
    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        const queryTotalNotification = "SELECT COUNT(*) AS total FROM notifications"
        db.query(queryTotalNotification, (err, totalResult) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }

            const total = totalResult[0].total;
            const totalPages = Math.ceil(total / limit);
            res.json({
                message: results,
                totalRecords: total,
                totalPages: totalPages,
                currentPage: page,
            });
        })
    })

}