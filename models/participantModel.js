import db from '../config/db.js';

export const createStudentScoresTable = () => {
    const sql = `
  CREATE TABLE IF NOT EXISTS student_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_matNo VARCHAR(20) NOT NULL,
    level_of_entry ENUM('Gold', 'Silver', 'Bronze') NOT NULL,
    adventures_journey INT CHECK(adventures_journey <= 25),
    voluntary_service INT CHECK(voluntary_service <= 25),
    physical_recreation INT CHECK(physical_recreation <= 25),
    skills_and_interest INT CHECK(skills_and_interest <= 25),
    residential_project INT CHECK(residential_project <= 20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_matNo) REFERENCES student (student_matNo) ON DELETE CASCADE
);
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('student_scores created or already exists');
    });
};
