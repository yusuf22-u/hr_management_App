import db from "../config/db.js";

export const createCenterFormTable = () => {
    const sql = `CREATE TABLE IF NOT EXISTS centerForm(
     id INT AUTO_INCREMENT PRIMARY KEY,
     studentId VARCHAR(20) NOT NULL,
     school VARCHAR(155) NOT NULL,
     address VARCHAR(100) NOT NULL,
     email VARCHAR(255) NOT NULL,
     telephone VARCHAR(15) NOT NULL,
     region VARCHAR(255) NOT NULL,
     coordinator VARCHAR(255) NOT NULL,
     area VARCHAR(200) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (studentId) REFERENCES student(student_matNo)
    
    );`

    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return console.log("center Form exist")
        }
        return console.log('Center form created ')

    })
}
