import db from "../config/db.js";

export const createStock = (req, res) => {
    const { item_id, transactions_type, quantity } = req.body
    //check if item_id exit
    const insertQuery = `INSERT INTO stock_transactions( item_id, transactions_type, quantity) VALUES(?,?,?)`
    const sql = `SELECT id FROM items WHERE id=?`

    db.query(sql, [item_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "server Error", err })
        }
        if (result.length == 0) {
            return res.status(404).json({ error: "item not found" })
        }

        db.query(insertQuery, [item_id, transactions_type, quantity], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "server Error", err })
            }
            return res.status(200).json({ message: "New stock succefully created" })
        })
    })

}
export const getAllTheStock = (req, res) => {
    const sql = `
        SELECT 
            items.name AS item_name, 
            items.image_url AS item_image_url, 
            stock_transactions.id, 
            stock_transactions.transactions_type, 
            stock_transactions.quantity, 
            stock_transactions.date 
        FROM stock_transactions
        JOIN items ON stock_transactions.item_id = items.id
    `;
    const stock_in = 'SELECT COUNT(*) AS totalStock_In FROM stock_transactions WHERE  transactions_type="stock-in"';
    const stock_out = 'SELECT COUNT(*) AS totalStock_Out FROM stock_transactions WHERE  transactions_type="stock-out"';
    db.query(stock_out, (err, stock_inResult) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err });
        }
        const totalStock_Out = stock_inResult[0].totalStock_Out;
        db.query(stock_in, (err, stock_inResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database query error: ' + err });
            }
            const totalStock_In = stock_inResult[0].totalStock_In;


            db.query(sql, (err, result) => {
                if (err) return res.status(500).json({ error: "server error", err });
                return res.status(200).json({
                    result,
                    totalStock_In,
                    totalStock_Out
                });
            });
        })
    })
};

export const getSingleStock = (req, res) => {
    const { id } = req.params

    const sql = `
        SELECT st.*, i.name AS item_name, i.image_url AS item_pic,i.description
        FROM stock_transactions st
        JOIN items i ON st.item_id = i.id
        WHERE st.id = ?
    `;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "server error", err });
        }
        if (result.length == 0) {
            return res.status(404).json({ error: "stock not found" });
        }
        return res.status(200).json(result[0]);
    })
}
export const deleteStock = (req, res) => {
    const { id } = req.params
    const sql = `DELETE FROM  stock_transactions WHERE id=?`
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "server error", err });
        return res.status(200).json({ message: "stock deleted successfully" });
    })
}
export const updateStock = (req, res) => {
    const { id } = req.params;
    const { item_id, transactions_type, quantity } = req.body;

    const Checkitem_id = 'SELECT id FROM items WHERE id=?'
    const sql = `UPDATE stock_transactions SET item_id = ?, transactions_type = ?, quantity = ? WHERE id = ?`;
    db.query(Checkitem_id, [item_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "server Error", err })
        }
        if (result.length == 0) {
            return res.status(404).json({ error: "item not found" })
        }
        db.query(sql, [item_id, transactions_type, quantity, id], (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).json({ error: "Server error", err });
            }

            // Check if any rows were affected
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Stock not found" });
            }

            return res.status(200).json({ message: "Update is successful", result });
        });
    })
};
