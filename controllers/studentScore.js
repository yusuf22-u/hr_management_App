import db from '../config/db.js';

export const addStudentScore = (req, res) => {
    console.log('Incoming data:', req.body);
    const {
        student_matNo,
        level_of_entry,
        adventures_journey,
        voluntary_service,
        physical_recreation,
        skills_and_interest,
        residential_project
    } = req.body;

    // Define maximum scores based on level
    const maxScoreByLevel = {
        Gold: 20,
        Silver: 25,
        Bronze: 25
    };

    // Validate if the level is correct and get the appropriate max score
    const maxScore = maxScoreByLevel[level_of_entry];
    if (maxScore === undefined) {
        return res.status(400).json({ error: "Invalid level of entry. Allowed levels are Gold, Silver, and Bronze." });
    }

    // Validate score limits for each category
    const scoreExceedsLimit =
        adventures_journey > maxScore ||
        voluntary_service > maxScore ||
        physical_recreation > maxScore ||
        skills_and_interest > maxScore ||
        (level_of_entry === 'Gold' && residential_project > maxScoreByLevel['Gold']);

    if (scoreExceedsLimit) {
        return res.status(400).json({ error: "One or more scores exceed the maximum allowed for the selected level." });
    }

    try {
        // Check if student exists and validate their level of entry
        const checkStudentQuery = `
            SELECT level_of_entry FROM student WHERE student_matNo = ?
        `;
        db.query(checkStudentQuery, [student_matNo], (err, results) => {
            if (err) {
                console.error("Error querying student:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            // If no student found with that student_matNo
            if (results.length === 0) {
                return res.status(404).json({ error: "Student not found." });
            }

            // Check if the level_of_entry matches the student’s record
            const studentLevel = results[0].level_of_entry;
            if (studentLevel !== level_of_entry) {
                return res.status(400).json({ error: `The level of entry does not match. Expected level is ${studentLevel}.` });
            }

            // Proceed to insert the score entry if all checks pass
            const insertQuery = `
                INSERT INTO student_scores (
                    student_matNo, level_of_entry, adventures_journey,
                    voluntary_service, physical_recreation, skills_and_interest,
                    residential_project
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                student_matNo,
                level_of_entry,
                adventures_journey,
                voluntary_service,
                physical_recreation,
                skills_and_interest,
                level_of_entry === 'Gold' ? residential_project : null
            ];

            db.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error("Error adding student score:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                res.status(201).json({ message: "Student score entry added successfully" });
            });
        });
    } catch (error) {
        console.error("Error adding student score:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// Get scores for a specific student and level of entry
export const getStudentScores = (req, res) => {
    const { id } = req.params;

    try {
        const query = `
           SELECT 
    s.full_name AS student_name, 
    s.student_matNo, 
    s.center,
    sc.*
FROM student AS s
JOIN student_scores AS sc ON s.student_matNo = sc.student_matNo
WHERE sc.id = ?;

        `;

        db.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error fetching student scores:', error);
                return res.status(500).json({ message: 'Server error.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No records found for this student.' });
            }

            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get scores for a specific student and level of entry
export const getALLStudentScores = (req, res) => {

    try {
        const query = `
            SELECT 
                s.full_name AS student_name,
                s.profile_pic, 
                s.student_matNo, 
                s.center,
                sc.id,
                sc.level_of_entry, 
                sc.adventures_journey, 
                sc.voluntary_service, 
                sc.physical_recreation, 
                sc.skills_and_interest, 
                sc.residential_project
            FROM student AS s
            JOIN student_scores AS sc ON s.student_matNo = sc.student_matNo
           
        `;

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching student scores:', error);
                return res.status(500).json({ message: 'Server error.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No records found.' });
            }

            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
export const deleteScore = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM student_scores WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Server error.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No records found.' });
        }

        res.status(200).json({ message: "Grade successfully deleted" });
    });
};

export const getStudentScore = async (req, res) => {
    const { id } = req.params;
    const sql = `SELECT student_matNo, level_of_entry, adventures_journey, voluntary_service, physical_recreation, skills_and_interest, residential_project FROM student_scores WHERE id = ?`

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'server', err });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Student score not found' });
        }
        res.status(200).json(result[0]);

    })
    
};
// Assuming 'db' is your database connection instance.
export const updateStudentScore = (req, res) => {
    console.log('Incoming data for update:', req.body);
    const id = req.params.id;

    const {
   
        level_of_entry,
        adventures_journey,
        voluntary_service,
        physical_recreation,
        skills_and_interest,
        residential_project
    } = req.body;

    // Define maximum scores by level
    const maxScoreByLevel = {
        Gold: 20,
        Silver: 25,
        Bronze: 25
    };

    // Validate if the level is correct and get the appropriate max score
    const maxScore = maxScoreByLevel[level_of_entry];
    if (maxScore === undefined) {
        return res.status(400).json({ error: "Invalid level of entry. Allowed levels are Gold, Silver, and Bronze." });
    }

    // Validate score limits for each category
    const scoreExceedsLimit =
        adventures_journey > maxScore ||
        voluntary_service > maxScore ||
        physical_recreation > maxScore ||
        skills_and_interest > maxScore ||
        (level_of_entry === 'Gold' && residential_project > maxScore);

    if (scoreExceedsLimit) {
        return res.status(400).json({ error: "One or more scores exceed the maximum allowed for the selected level." });
    }

    try {
        // Verify student exists and their level of entry for the given ID
        const checkStudentQuery = `SELECT level_of_entry FROM student_scores WHERE id = ?`;
        
        db.query(checkStudentQuery, [id], (err, results) => {
            if (err) {
                console.error("Error querying student score entry:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            // If no entry found with that ID
            if (results.length === 0) {
                return res.status(404).json({ error: "Score entry not found." });
            }

            // Check if the level_of_entry matches the existing record
            const studentLevel = results[0].level_of_entry;
            if (studentLevel !== level_of_entry) {
                return res.status(400).json({ error: `The level of entry does not match. Expected level is ${studentLevel}.` });
            }

            // Proceed to update the score entry if all checks pass
            const updateQuery = `
                UPDATE student_scores SET 
                    adventures_journey = ?, 
                    voluntary_service = ?, 
                    physical_recreation = ?, 
                    skills_and_interest = ?, 
                    residential_project = ?
                WHERE id = ?
            `;
            const values = [
                adventures_journey,
                voluntary_service,
                physical_recreation,
                skills_and_interest,
                level_of_entry === 'Gold' ? residential_project : null,
                id
            ];

            db.query(updateQuery, values, (err, result) => {
                if (err) {
                    console.error("Error updating student score:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Score entry not found or not updated." });
                }

                res.status(200).json({ message: "Student score entry updated successfully" });
            });
        });
    } catch (error) {
        console.error("Error updating student score:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

