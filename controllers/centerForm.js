import db from "../config/db.js";

export const createCenter = (req, res) => {
    const { studentId, school, address, email, telephone, region, coordinator, area } = req.body;

    // Validate required fields
    if (!studentId || !school || !address || !email || !telephone || !region || !coordinator || !area) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the student exists
    const checkStudentNo = `SELECT * FROM student WHERE student_matNo = ?`;
    db.query(checkStudentNo, [studentId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "The student doesn't exist" });
        }

        // Check if student is already registered
        const checkStudentExist = `SELECT area FROM centerform WHERE studentId = ?`;
        db.query(checkStudentExist, [studentId], (err, result) => {
            if (err) {
                // console.error("Database error:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            if (result.length > 0) {
                return res.status(409).json({ error: `Student is already registered under ${result[0].area} center` });
            }

            // Insert new center record
            const insertQuery = `INSERT INTO centerform (studentId, school, address, email, telephone, region, coordinator, area) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [studentId, school, address, email, telephone, region, coordinator, area];

            db.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Internal server error" });
                }
                return res.status(201).json({ message: "Registration is successful" });
            });
        });
    });
};
export const getCenterWithStudent = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const countQuery = 'SELECT COUNT(*) AS totalCount FROM student';
    db.query(countQuery, (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: 'Database count query error: ' + err });
        }
        const totalCount = countResult[0].totalCount;

        const sql = `
        SELECT s.full_name, s.profile_pic, s.level_of_entry, s.mode_of_entry,centerForm.id, centerForm.region, centerForm.area, centerForm.school, centerForm.created_at, centerForm.studentId 
        FROM student s
        JOIN centerForm ON s.student_matNo = centerForm.studentId
        ORDER BY centerForm.created_at DESC
        LIMIT ? OFFSET ?`;
    

        db.query(sql, [limit, offset], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Server error" });
            }
            return res.status(200).json({
                participant: result,
                totalCount:totalCount
            });
        });
    })

};

export const getParticipantById = (req, res) => {
    console.log('id:', req.params); // Corrected logging
    
    try {
        const { studentId } = req.params; // Extract studentId from params

        if (!studentId) {
            return res.status(400).json({ error: "Student ID is required" });
        }

        const sql = `
            SELECT s.full_name, s.profile_pic, s.level_of_entry, s.mode_of_entry, centerForm.* 
            FROM student s
            JOIN centerForm ON s.student_matNo = centerForm.studentId
            WHERE centerForm.id = ?`;

        db.query(sql, [studentId], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "Participant not found" });
            }

            console.log('user:', result[0]); // Correct placement
            return res.status(200).json(result[0]); // Return a single object
        
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Unexpected server error" });
    }
};

export const deleteParticipant = (req, res) => {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
        return res.status(400).json({ error: "Participant ID is required" });
    }

    const sql = `DELETE FROM centerForm WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Participant not found or already deleted" });
        }

        return res.status(200).json({ message: "Participant deleted successfully" });
    });
};
//get participant data from registeration center
export const getSingleParticipant = (req, res) => {
    const { id } = req.params
    if (!id) {
        return res.status(400).json({ error: "participant id is required" })
    }
    const sql = `SELECT * FROM centerform WHERE id=?`
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log("database err", err)
            return res.status(500).json({ error: "server error" })
        }
        if (result.length <= 0) {
            return res.status(404).json({ error: "participant not found" })
        }
        return res.status(200).json(result[0])
    })
}
export const updateParticipan = (req, res) => {
    const { id } = req.params;
    const { studentId, school, address, email, telephone, region, coordinator, area } = req.body;

    // Validate required fields
    if (!studentId || !school || !address || !email || !telephone || !region || !coordinator || !area) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the student exists
    const checkStudent = `SELECT * FROM student WHERE student_matNo = ?`;
    db.query(checkStudent, [studentId], (err, studentResult) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (studentResult.length === 0) {
            return res.status(404).json({ error: "The student doesn't exist" });
        }

        // Check if studentId already exists in centerform (excluding current record)
        const checkDuplicate = `SELECT * FROM centerform WHERE studentId = ? AND id != ?`;
        db.query(checkDuplicate, [studentId, id], (err, duplicateResult) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            if (duplicateResult.length > 0) {
                return res.status(400).json({ error: "This student ID is already assigned to another record" });
            }

            // Proceed with update
            const updateQuery = `UPDATE centerform 
                SET studentId=?, school=?, address=?, email=?, telephone=?, region=?, coordinator=?, area=? 
                WHERE id=?`;
            db.query(updateQuery, [studentId, school, address, email, telephone, region, coordinator, area, id], (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Server error" });
                }
                if (result.affectedRows === 0) {
                    return res.status(400).json({ error: "Failed to update participant record" });
                }
                return res.status(200).json({ message: "Record updated successfully" });
            });
        });
    });
};
