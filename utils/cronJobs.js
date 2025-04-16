import cron from "node-cron";
// import db from "../config/db.js"; 
import db from "../config/db.js";// Import your DB connection
const notifyAdminIfUnpaid = () => {
    const today = new Date();
    const sql = `SELECT COUNT(*) AS unpaidCount FROM payroll WHERE payment_status = 'Unpaid' AND MONTH(salary_date) = MONTH(CURDATE())`;

    if (today.getDate() >= 25) { // Run only after the 25th of the month
        db.query(sql, (err, result) => {
            if (err) {
                console.error("❌ Error checking unpaid employees:", err);
                return;
            }
            // if(result[0].unpaidCount ===0){
            //     console.log("all apy")
            // }

            if (result[0].unpaidCount > 0) {
                console.log("⚠️ Reminder: Some employees have not been paid this month!");

                // Insert notification into the database
                const textMessage = "Unpaid employees detected. Please process payroll.";
                const saveNotificationSQL = `INSERT INTO emailtable (message, created_at) VALUES (?, NOW())`;

                db.query(saveNotificationSQL, [textMessage], (err, result) => {
                    if (err) {
                        console.error("❌ Error saving notification:", err);
                    } else {
                        console.log("✅ Notification saved successfully:", result);
                    }
                });
            }
        });
    }
};

// Schedule to run every day at 8 AM
cron.schedule("0 8 * * *", () => {
    console.log("🔄 Running scheduled job: Checking unpaid salaries...");
    notifyAdminIfUnpaid();
});

export default cron;
