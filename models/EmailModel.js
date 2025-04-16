import db from '../config/db.js';

export const createEmailTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS emailTable (
               id INT AUTO_INCREMENT PRIMARY KEY,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Error creating email table:", err);
            return;
        }
        console.log('Email table created or already exists');
    });
};