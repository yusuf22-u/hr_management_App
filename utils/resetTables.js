import db from '../config/db.js';

export const dropTables = async () => {
  try {
    // Disable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop child tables first, then parent tables
    await db.query(`DROP TABLE IF EXISTS payroll`);
    // await db.query(`DROP TABLE IF EXISTS message`);
    // await db.query(`DROP TABLE IF EXISTS notifications`);
  
    // await db.query(`DROP TABLE IF EXISTS item_allocations`);
    // await db.query(`DROP TABLE IF EXISTS stock`);
    // await db.query(`DROP TABLE IF EXISTS items`);
    // await db.query(`DROP TABLE IF EXISTS student_scores`);
    // await db.query(`DROP TABLE IF EXISTS students`);
    // await db.query(`DROP TABLE IF EXISTS staff_evaluation`);
    // await db.query(`DROP TABLE IF EXISTS leaves`);
    // await db.query(`DROP TABLE IF EXISTS employee_certificates`);
    // await db.query(`DROP TABLE IF EXISTS center_forms`);
    // await db.query(`DROP TABLE IF EXISTS emails`);
    // await db.query(`DROP TABLE IF EXISTS users`);
    // await db.query(`DROP TABLE IF EXISTS employees`);
  

    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ All tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
  }
};
