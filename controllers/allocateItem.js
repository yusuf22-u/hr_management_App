import db from "../config/db.js";
import logger from "../utils/logger.js";
export const createAllocation = async (req, res) => {
    const { item_number, staff_id, quantity } = req.body;

    logger.info(`Received allocation request: item_number=${item_number}, staff_id=${staff_id}, quantity=${quantity}`);

    try {
        // Get item_id using item_number
        const [itemResults] = await db.query(`SELECT id FROM items WHERE item_number = ?`, [item_number]);
        if (itemResults.length === 0) {
            logger.warn(`Item not found with number: ${item_number}`);
            return res.status(404).json({ error: 'Item not found' });
        }
        const item_id = itemResults[0].id;

        // Validate staff_id
        const [staffResults] = await db.query(`SELECT employee_id FROM employees WHERE employee_id=?`, [staff_id]);
        if (staffResults.length === 0) {
            logger.warn(`Employee not found with ID: ${staff_id}`);
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Insert allocation
        const [insertResults] = await db.query(
            `INSERT INTO item_allocations (item_id, staff_id, quantity) VALUES (?, ?, ?)`,
            [item_id, staff_id, quantity]
        );

        logger.info(`Item allocated: item_id=${item_id}, staff_id=${staff_id}, quantity=${quantity}`);
        return res.status(200).json({ message: "Item successfully allocated", data: insertResults });
    } catch (err) {
        logger.error(`Error in createAllocation: ${err.message}`);
        return res.status(500).json({ error: 'Server error', err });
    }
};


// Get Assigned Items
export const getAssignItem = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                employees.full_name AS employee_name, 
                employees.department,
                items.name,
                 items.item_number,  
                item_allocations.id,
                
                item_allocations.quantity, 
                item_allocations.is_returned, 
                item_allocations.returned_at, 
                item_allocations.allocated_at
            FROM item_allocations 
            JOIN employees ON item_allocations.staff_id = employees.employee_id
            JOIN items ON item_allocations.item_id = items.id
        `);

        logger.info("Fetched all item allocations");
        return res.status(200).json({ data: results });
    } catch (err) {
        logger.error(`Error in getAssignItem: ${err.message}`);
        return res.status(500).json({ error: "Server error", err });
    }
};

// Delete Allocation
export const deleteAllocation = async (req, res) => {
    const { id } = req.params;
    logger.info(`Attempting to delete allocation with ID: ${id}`);

    try {
        const [result] = await db.query(`DELETE FROM item_allocations WHERE id=?`, [id]);

        if (result.affectedRows === 0) {
            logger.warn(`Allocation not found for deletion with ID: ${id}`);
            return res.status(404).json({ error: 'Allocation not found' });
        }

        logger.info(`Allocation deleted with ID: ${id}`);
        return res.status(200).json({ message: 'Allocation deleted successfully', allocationId: id });
    } catch (err) {
        logger.error(`Error in deleteAllocation: ${err.message}`);
        return res.status(500).json({ error: 'Server error', err });
    }
};

// Update Return
export const updateReturn = async (req, res) => {
    const { id } = req.params;
    const currentTime = new Date();
    const isReturned = true;

    logger.info(`Marking allocation ID ${id} as returned`);

    try {
        const [result] = await db.query(
            'UPDATE item_allocations SET returned_at = ?, is_returned = ? WHERE id = ?',
            [currentTime, isReturned, id]
        );

        if (result.affectedRows === 0) {
            logger.warn(`Allocation not found for return update with ID: ${id}`);
            return res.status(404).json({ error: 'Allocation not found' });
        }

        logger.info(`Item marked as returned for allocation ID: ${id}`);
        return res.status(200).json({ message: 'Item returned successfully', allocationId: id });
    } catch (err) {
        logger.error(`Error in updateReturn: ${err.message}`);
        return res.status(500).json({ error: 'Server error', err });
    }
};
