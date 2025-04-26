import db from "../config/db.js";
export const createStock = async (req, res) => {
    const { item_number, transactions_type, quantity } = req.body;

    try {
        // Step 1: Check if item exists in items table
        const [itemResult] = await db.query(
            'SELECT item_number FROM items WHERE item_number = ?',
            [item_number]
        );

        if (itemResult.length === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        // Step 2: Check if item already exists in stock_transactions
        const [stockResult] = await db.query(
            'SELECT item_number FROM stock_transactions WHERE item_number = ?',
            [item_number]
        );

        if (stockResult.length > 0) {
            return res.status(400).json({ error: "Item with same number already exists in stock." });
        }

        // Step 3: Insert new stock
        await db.query(
            'INSERT INTO stock_transactions (item_number, transactions_type, quantity) VALUES (?, ?, ?)',
            [item_number, transactions_type, quantity]
        );

        return res.status(200).json({ message: "New stock successfully created" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", details: error });
    }
};

export const getAllTheStock = async (req, res) => {
    try {
        // Get total stock out
        const [stockOutResult] = await db.query(
            'SELECT COUNT(*) AS totalStock_Out FROM stock_transactions WHERE transactions_type = "stock-out"'
        );
        const totalStock_Out = stockOutResult[0].totalStock_Out;

        // Get total stock in
        const [stockInResult] = await db.query(
            'SELECT COUNT(*) AS totalStock_In FROM stock_transactions WHERE transactions_type = "stock-in"'
        );
        const totalStock_In = stockInResult[0].totalStock_In;

        // Get all stock details
        const [stocks] = await db.query(`
            SELECT 
                items.name AS item_name, 
                items.image_url AS item_image_url, 
                stock_transactions.id, 
                stock_transactions.transactions_type, 
                stock_transactions.quantity, 
                stock_transactions.date,
                stock_transactions.item_number 
            FROM stock_transactions
            JOIN items ON stock_transactions.item_number = items.item_number
        `);

        return res.status(200).json({
            result: stocks,
            totalStock_In,
            totalStock_Out
        });
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error });
    }
};
export const getSingleStock = async (req, res) => {
    const { id } = req.params;

    try {
        const [stock] = await db.query(
            `SELECT 
                items.name AS item_name,
                items.description, 
                items.image_url AS item_image_url, 
                stock_transactions.id, 
                stock_transactions.transactions_type, 
                stock_transactions.quantity, 
                stock_transactions.date,
                stock_transactions.item_number 
            FROM stock_transactions
            JOIN items ON stock_transactions.item_number = items.item_number`,
            [id]
        );

        if (stock.length === 0) {
            return res.status(404).json({ error: "Stock item not found" });
        }

        return res.status(200).json(stock[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", details: error });
    }
};

export const deleteStock = async (req, res) => {
    const { id } = req.params;

    try {
        const [stockResult] = await db.query(
            'SELECT * FROM stock_transactions WHERE id = ?',
            [id]
        );

        if (stockResult.length === 0) {
            return res.status(404).json({ error: "Stock item not found" });
        }

        await db.query(
            'DELETE FROM stock_transactions WHERE id = ?',
            [id]
        );

        return res.status(200).json({ message: "Stock item deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", details: error });
    }
};

export const updateStock = async (req, res) => {
    const { id } = req.params;
    const { transactions_type, quantity } = req.body;

    try {
        // Check if stock item exists
        const [stockResult] = await db.query(
            'SELECT * FROM stock_transactions WHERE id = ?',
            [id]
        );

        if (stockResult.length === 0) {
            return res.status(404).json({ error: "Stock item not found" });
        }

        // Update stock
        await db.query(
            'UPDATE stock_transactions SET transactions_type = ?, quantity = ? WHERE id = ?',
            [transactions_type, quantity, id]
        );

        return res.status(200).json({ message: "Stock item updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error", details: error });
    }
};
