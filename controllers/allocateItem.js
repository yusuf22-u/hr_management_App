import db from "../config/db.js"



export const createAllocation = (req, res) => {
    const sql = `SELECT id FROM items WHERE id=?`;
    const checkStaff_id = `SELECT employee_id FROM employees WHERE employee_id=?`;
    const InsertQuery = `INSERT INTO item_allocations (item_id, staff_id, quantity) VALUES (?, ?, ?)`;
    const { item_id, staff_id, quantity } = req.body;

    // Check if the item exists
    db.query(sql, [item_id], (err, itemResults) => {
        if (err) {
            return res.status(500).json({ error: 'server error', err });
        }
        if (itemResults.length === 0) {
            return res.status(404).json({ error: 'item not found' });
        }

        // Check if the staff exists
        db.query(checkStaff_id, [staff_id], (err, staffResults) => {
            if (err) {
                return res.status(500).json({ error: 'server error', err });
            }
            if (staffResults.length === 0) {
                return res.status(404).json({ error: 'employee not found' });
            }

            // Insert allocation if both checks pass
            db.query(InsertQuery, [item_id, staff_id, quantity], (err, insertResults) => {
                if (err) {
                    return res.status(500).json({ error: 'server error', err });
                }
                return res.status(200).json({ message: "Item successfully allocated", data: insertResults });
            });
        });
    });
};
export const getAssignItem = (req, res) => {
    const sql = `SELECT employees.full_name AS employee_name, employees.department,
    items.name,item_allocations.id,item_allocations.quantity, item_allocations.is_returned,item_allocations.returned_at,item_allocations.allocated_at
    FROM item_allocations JOIN   employees ON item_allocations.staff_id = employees.employee_id
    JOIN  items ON item_allocations.item_id = items.id`
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "server error", err })
        return res.status(200).json({ data: results })
    })
}
export const deleteAllocation = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM item_allocations WHERE id=?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'server error', err });
        }
        // Check if any rows were affected (to handle the case when the ID does not exist)
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Allocation not found' });
        }
        res.status(200).json({ message: 'Allocation deleted successfully', allocationId: id });
    });
}
export const updateReturn = (req, res) => {
    const { id } = req.params;
    const currentTime = new Date();

    // Update the returned_at column and is_returned flag in your database
    const sql = 'UPDATE item_allocations SET returned_at = ?, is_returned = ? WHERE id = ?';
    const isReturned = true; // Set this to true when the item is returned

    db.query(sql, [currentTime, isReturned, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'server error', err });
        }
        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Allocation not found' });
        }
        res.status(200).json({ message: 'Item returned successfully', allocationId: id });
    });
}

