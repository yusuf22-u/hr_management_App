import db from '../config/db.js';
export const createStudent = (req, res) => {
  const {
    student_matNo,
    full_name,
    gender,
    email,
    address,
    phone_number,
    date_of_birth,
    date_of_admission,
    marital_status,
    parent_tel,
    parent_name,
    parent_email,
    occupation,
    level_of_entry,
    mode_of_entry,
    health_conditions,
    health_explanation,
    differently_abled,
    center
  } = req.body;

  // Validate required fields
  if (!student_matNo || !full_name || !email) {
    return res.status(400).json({ error: 'Matriculation number, full name, and email are required.' });
  }

  const profile_pic = req.file ? req.file.filename : null;

  // Ensure date fields are formatted correctly
  // You may want to use a library like moment.js or date-fns for validation
  const insertStudentQuery = `
 INSERT INTO student (
    student_matNo,
    full_name,
    gender,
    email,
    address,
    phone_number,
    profile_pic,
    date_of_birth,
    date_of_admission,
    marital_status,
    parent_tel,
    parent_name,
    parent_email,
    occupation,
    level_of_entry,
    mode_of_entry,
    health_conditions,
    health_explanation,
    differently_abled,
    center
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?);
`;


  db.query(insertStudentQuery, [
    student_matNo,
    full_name,
    gender,
    email,
    address,
    phone_number,
    profile_pic,
    date_of_birth,
    date_of_admission,
    marital_status,
    parent_tel,
    parent_name,
    parent_email,
    occupation,
    level_of_entry,
    mode_of_entry,
    health_conditions,
    health_explanation,
    differently_abled,
    center
  ], (err, result) => {
    if (err) {
      console.error('Database query error:', err);

      if (err.code === 'ER_DUP_ENTRY') {
        const errorMessage = err.message.includes('email')
          ? 'Email already exists'
          : 'Matriculation number already exists';
        return res.status(400).json({ error: errorMessage });
      }

      // Handle other database errors
      return res.status(500).json({ error: 'Database query error: ' + err.message });
    }

    res.status(201).json({ message: 'Student added successfully', studentId: result.insertId });
  });
};

export const getAllStudents = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) AS totalCount FROM student';
  const femaleCountQuery = 'SELECT COUNT(*) AS totalFemale FROM student WHERE gender="Female"';
  const maleCountQuery = 'SELECT COUNT(*) AS totalMale FROM student WHERE gender="Male"';
  const goldStudentQuery = 'SELECT COUNT(*) AS totalGold FROM student WHERE level_of_entry="Gold"';
  const silverStudentQuery = 'SELECT COUNT(*) AS totalSilver FROM student WHERE level_of_entry="Silver"';
  const bronzeStudentQuery = 'SELECT COUNT(*) AS totalBronze FROM student WHERE level_of_entry="Bronze"';
  const studentsPerYearQuery = `
    SELECT YEAR(date_of_admission) AS year, COUNT(*) AS totalStudents
    FROM student
    GROUP BY YEAR(date_of_admission)
    ORDER BY year
  `;
  const studentQuery = 'SELECT * FROM student LIMIT ? OFFSET ?';

  // Start with total count query
  db.query(countQuery, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database count query error: ' + err });
    }
    const totalCount = countResult[0].totalCount;

    // Query for female count
    db.query(femaleCountQuery, (err, femaleResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error: ' + err });
      }
      const femaleCount = femaleResult[0].totalFemale;

      // Query for male count
      db.query(maleCountQuery, (err, maleResult) => {
        if (err) {
          return res.status(500).json({ error: 'Database query error: ' + err });
        }
        const maleCount = maleResult[0].totalMale;

        // Query for gold student count
        db.query(goldStudentQuery, (err, goldResult) => {
          if (err) {
            return res.status(500).json({ error: 'Database query error: ' + err });
          }
          const goldCount = goldResult[0].totalGold;

          // Query for silver student count
          db.query(silverStudentQuery, (err, silverResult) => {
            if (err) {
              return res.status(500).json({ error: 'Database query error: ' + err });
            }
            const silverCount = silverResult[0].totalSilver;

            // Query for bronze student count
            db.query(bronzeStudentQuery, (err, bronzeResult) => {
              if (err) {
                return res.status(500).json({ error: 'Database query error: ' + err });
              }
              const bronzeCount = bronzeResult[0].totalBronze;

              // Query for students per year
              db.query(studentsPerYearQuery, (err, studentsPerYearResult) => {
                if (err) {
                  return res.status(500).json({ error: 'Database query error: ' + err });
                }

                // Final query for student data
                db.query(studentQuery, [limit, offset], (err, results) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database query error: ' + err });
                  }

                  // Respond with all gathered data
                  res.json({
                    totalCount,
                    femaleCount,
                    maleCount,
                    goldCount,
                    silverCount,
                    bronzeCount,
                    studentsPerYear: studentsPerYearResult, // Array of { year, totalStudents }
                    students: results
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};



export const deleteStudent = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM student WHERE student_matNo=?'
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ Status: false, error: "query error" + err })
    }
    if (result.length === 0) {
      return res.status(404).json({ status: false, error: 'no record found' });
    }
    return res.json({ Status: true, msg: "employee is successfully deleted" })
  })
}
// Get a single student by ID
export const getStudentById = (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM student WHERE student_matNo = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ status: false, error: 'Database query error: ' + err });
    }
    // console.log(result); 
    if (result.length === 0) {
      return res.status(404).json({ status: false, error: 'student not found' });
    }
    res.json(result[0]);
  });
};
//uddate router
export const updateStudent = (req, res) => {
  const { id } = req.params;
  const { full_name, gender, email, address, phone_number, date_of_birth, date_of_admission, marital_status, parent_name, parent_tel, parent_email, occupation, health_conditions, health_explanation, differently_abled, level_of_entry, mode_of_entry, center } = req.body;

  // Step 1: Fetch the existing student record
  const getExistingStudentQuery = 'SELECT profile_pic FROM student WHERE student_matNo = ?';

  db.query(getExistingStudentQuery, [id], (err, results) => {
    if (err) {
      console.error('Database query error while fetching existing student:', err);
      return res.status(500).json({ status: false, error: 'Database query error: ' + err });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: false, error: 'Student not found' });
    }

    const existingProfilePic = results[0].profile_pic;

    // Step 2: Determine the profile_pic value
    let profile_pic = existingProfilePic; // Default to existing profile pic
    if (req.file) {
      profile_pic = req.file.filename; // Update with new file if provided
    }

    // Step 3: Perform the update query
    const updateStudentQuery = `
      UPDATE student
      SET
        full_name = ?,
        gender = ?,
        email = ?,
        address = ?,
        phone_number = ?,
        date_of_birth = ?,
        date_of_admission = ?,
        marital_status = ?,
        parent_name = ?,
        parent_tel = ?,
        parent_email = ?,
        occupation = ?,
        health_conditions = ?,
        health_explanation = ?,
        differently_abled = ?,
        level_of_entry = ?,
        mode_of_entry = ?,
        center = ?,
        profile_pic = ?
      WHERE student_matNo = ?
    `;

    db.query(updateStudentQuery, [full_name, gender, email, address, phone_number, date_of_birth, date_of_admission, marital_status, parent_name, parent_tel, parent_email, occupation, health_conditions, health_explanation, differently_abled, level_of_entry, mode_of_entry, center, profile_pic, id], (err, result) => {
      if (err) {
        console.error('Database query error while updating student:', err);
        return res.status(500).json({ status: false, error: 'Database query error: ' + err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ status: false, error: 'Student update failed, no records were updated' });
      }

      res.json({ status: true, message: 'Student updated successfully' });
    });
  });
};


// Add this function in your studentController.js
export const getGenderAndMaritalStatusCounts = (req, res) => {
  const genderCountQuery = `
    SELECT gender, marital_status, COUNT(*) AS count
    FROM student
    GROUP BY gender, marital_status
  `;

  db.query(genderCountQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err });
    }

    res.json(results);
  });
};
export const getStudentsByFilter = async (req, res) => {
  const { levelOfEntry, year } = req.body; // Assuming you are sending the filter criteria in the request body

  // Basic validation
  if (!levelOfEntry && !year) {
    return res.status(400).json({ message: 'At least one of level_of_entry or year is required.' });
  }

  // Create an array for query parameters
  const queryParams = [];
  let query = 'SELECT * FROM student WHERE 1=1'; // Start with a base query

  // Add conditions dynamically based on the provided filters
  if (levelOfEntry) {
    query += ' AND level_of_entry = ?';
    queryParams.push(levelOfEntry);
  }

  if (year) {
    query += ' AND YEAR(date_of_admission) = ?';
    queryParams.push(year);
  }

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ message: 'Database query error', error });
    }

    if (results.length === 0) {
      console.log('No records found for level_of_entry:', levelOfEntry, 'and year:', year);
      return res.status(404).json({ message: 'No records found.' });
    } else {
      console.log('Query results:', results);
      return res.status(200).json(results);
    }
  });
};

export const getStudentLevelDistribution = (req, res) => {
  const query = `
    SELECT level_of_entry, COUNT(*) AS count
    FROM student
    GROUP BY level_of_entry
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err });
    }
    res.json(results);
  });
};