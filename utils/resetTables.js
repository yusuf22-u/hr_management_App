import db from '../config/db.js';

export const dropTables = async () => {
  try {
    // Drop item table first (if it depends on users via FK)
    await db.query(`DROP TABLE IF EXISTS leaves`);
    console.log('✅ leave table dropped');

    // Then drop users table
    await db.query(`DROP TABLE IF EXISTS users`);
    console.log('✅ users table dropped');
    
    // Then drop notification table
    await db.query(`DROP TABLE IF EXISTS  notifications`);
    console.log('✅ users table dropped');
     // Then drop payrol table
     await db.query(`DROP TABLE IF EXISTS  payroll`);
     console.log('✅ payroll table dropped');
      // Then drop notification table
    await db.query(`DROP TABLE IF EXISTS  message`);
    console.log('✅ message table dropped');

    await db.query(`DROP TABLE IF EXISTS  employee_certificates`);
    console.log('✅ employee_certificates table dropped');
  } catch (err) {
    console.error('❌ Error dropping tables:', err.message);
  }
};
