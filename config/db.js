import mysql from 'mysql2';
import dotenv from 'dotenv'

dotenv.config()
const DB_url=`mysql://root:iFNOCJPRXKZTkJXccHcTuZNhHsdlVDgW@mysql.railway.internal:3306/railway`

const db = mysql.createConnection(DB_url)
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_DATABASE


db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

export default db;
