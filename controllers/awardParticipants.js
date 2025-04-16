import db from '../config/db.js';

// Calculate expected completion date
export const calculateCompletionDate = (participationDate, score) => {
    const totalDaysForCompletion = 100; // Assume program is completed in 100 days
    const progressPercentage = score / 100; // Convert score to percentage (e.g., 50% if score is 50)

    // Remaining days based on score
    const remainingDays = totalDaysForCompletion * (1 - progressPercentage);

    // Add the remaining days to the participation date
    const participationDateObj = new Date(participationDate);
    participationDateObj.setDate(participationDateObj.getDate() + remainingDays);

    return participationDateObj.toISOString().split('T')[0]; // Return as YYYY-MM-DD format
};
// import { calculateCompletionDate } from '../helpers/calculateCompletionDate.js'; // Ensure this is imported correctly
// import db from '../config/db.js';

export const createParticipant = (req, res) => {
    const { student_id, level, score, condinator, participation_date } = req.body;

    // Check if the student exists in the database
    db.query('SELECT * FROM student WHERE student_matNo = ?', [student_id], (err, results) => {
        if (err) {
            console.error('Error checking student:', err);
            return res.status(500).json({ error: 'Server error', details: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Student ID does not exist' });
        }

        // Validate score range
        if (score < 0 || score > 100) {
            return res.status(400).json({ error: 'Score must be between 0 and 100.' });
        }

        // Calculate expected completion date based on score
        const expectedCompletionDate = calculateCompletionDate(participation_date, score);

        // Insert participant evaluation data
        const insertEvaluationQuery = `
            INSERT INTO participant_table (student_id, level, condinator, score, participation_date, expected_completion_date)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        db.query(insertEvaluationQuery, [student_id, level, condinator, score, participation_date, expectedCompletionDate], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ error: 'Database query error: ' + err });
            }

            res.json({ message: 'Evaluation added successfully', expected_completion_date: expectedCompletionDate });
        });
    });
};
export const getAllStudentParticipant = (req, res) => {
    const goldStudentQuery = 'SELECT COUNT(*) AS totalGold FROM participant_table WHERE level="gold"';
    const silverStudentQuery = 'SELECT COUNT(*) AS totalSilver FROM participant_table WHERE level="silver"';
    const bronzeStudentQuery = 'SELECT COUNT(*) AS totalBronze FROM participant_table WHERE level="bronze"';

    const sql = `
        SELECT 
            s.profile_pic, 
            s.full_name,
            s.gender,
            DATE_FORMAT(s.date_of_birth, '%Y-%m-%d') AS date_of_birth, 
            DATE_FORMAT(p.expected_completion_date, '%Y-%m-%d') AS expected_completion_date,
            DATE_FORMAT(p.participation_date, '%Y-%m-%d') AS participation_date,
            p.condinator, 
            p.level, 
            p.score
        FROM participant_table p
        JOIN student s ON s.student_matNo = p.student_id
    `;

    // Query for gold count
    db.query(goldStudentQuery, (err, goldResult) => {
        if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err });
        }
        const goldCount = goldResult[0].totalGold;

        // Query for silver count
        db.query(silverStudentQuery, (err, silverResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database query error: ' + err });
            }
            const silverCount = silverResult[0].totalSilver;

            // Query for bronze count
            db.query(bronzeStudentQuery, (err, bronzeResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Database query error: ' + err });
                }
                const bronzeCount = bronzeResult[0].totalBronze;

                // Query for student and participant data
                db.query(sql, (err, results) => {
                    if (err) {
                        return res.status(500).send('Server error');
                    }
                    res.status(200).json({
                        goldCount,
                        silverCount,
                        bronzeCount,
                        results
                    });
                });
            });
        });
    });
};
