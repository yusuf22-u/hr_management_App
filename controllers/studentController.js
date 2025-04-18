import db from '../config/db.js';

export const createStudent = async (req, res) => {
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

  try {
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

    const [result] = await db.query(insertStudentQuery, [
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
    ]);

    res.status(201).json({ message: 'Student added successfully', studentId: result.insertId });
  } catch (err) {
    console.error('Database query error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      const errorMessage = err.message.includes('email')
        ? 'Email already exists'
        : 'Matriculation number already exists';
      return res.status(400).json({ error: errorMessage });
    }
    return res.status(500).json({ error: 'Database query error: ' + err.message });
  }
};

export const getAllStudents = async (req, res) => {
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

  try {
    // Start with total count query
    const [[countResult]] = await db.query(countQuery);
    const totalCount = countResult.totalCount;

    // Query for female count
    const [[femaleResult]] = await db.query(femaleCountQuery);
    const femaleCount = femaleResult.totalFemale;

    // Query for male count
    const [[maleResult]] = await db.query(maleCountQuery);
    const maleCount = maleResult.totalMale;

    // Query for gold student count
    const [[goldResult]] = await db.query(goldStudentQuery);
    const goldCount = goldResult.totalGold;

    // Query for silver student count
    const [[silverResult]] = await db.query(silverStudentQuery);
    const silverCount = silverResult.totalSilver;

    // Query for bronze student count
    const [[bronzeResult]] = await db.query(bronzeStudentQuery);
    const bronzeCount = bronzeResult.totalBronze;

    // Query for students per year
    const [studentsPerYearResult] = await db.query(studentsPerYearQuery);

    // Final query for student data
    const [students] = await db.query(studentQuery, [limit, offset]);

    // Respond with all gathered data
    res.json({
      totalCount,
      femaleCount,
      maleCount,
      goldCount,
      silverCount,
      bronzeCount,
      studentsPerYear: studentsPerYearResult, // Array of { year, totalStudents }
      students
    });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Database query error: ' + err });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM student WHERE student_matNo=?';
  try {
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, error: 'Student not found' });
    }

    return res.json({ status: true, msg: 'Student successfully deleted' });
  } catch (err) {
    return res.status(500).json({ status: false, error: 'Query error: ' + err });
  }
};

export const getStudentById = async (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM student WHERE student_matNo = ?';
  try {
    const [[result]] = await db.query(query, [id]);

    if (!result) {
      return res.status(404).json({ status: false, error: 'Student not found' });
    }

    res.json(result);
  } catch (err) {
    return res.status(500).json({ status: false, error: 'Database query error: ' + err });
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { full_name, gender, email, address, phone_number, date_of_birth, date_of_admission, marital_status, parent_name, parent_tel, parent_email, occupation, health_conditions, health_explanation, differently_abled, level_of_entry, mode_of_entry, center } = req.body;

  try {
    const getExistingStudentQuery = 'SELECT profile_pic FROM student WHERE student_matNo = ?';
    const [[existingStudent]] = await db.query(getExistingStudentQuery, [id]);

    if (!existingStudent) {
      return res.status(404).json({ status: false, error: 'Student not found' });
    }

    const existingProfilePic = existingStudent.profile_pic;
    const profile_pic = req.file ? req.file.filename : existingProfilePic;

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

    const [updateResult] = await db.query(updateStudentQuery, [
      full_name, gender, email, address, phone_number, date_of_birth, date_of_admission, marital_status,
      parent_name, parent_tel, parent_email, occupation, health_conditions, health_explanation, differently_abled,
      level_of_entry, mode_of_entry, center, profile_pic, id
    ]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ status: false, error: 'Student update failed' });
    }

    res.json({ status: true, message: 'Student updated successfully' });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ status: false, error: 'Database query error: ' + err });
  }
};






export const getGenderAndMaritalStatusCounts = async (req, res) => {
  const genderCountQuery = `
    SELECT gender, marital_status, COUNT(*) AS count
    FROM student
    GROUP BY gender, marital_status
  `;

  try {
    const [results] = await db.query(genderCountQuery);
    res.json(results);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database  error'});
  }
};

export const getStudentsByFilter = async (req, res) => {
  const { levelOfEntry, year } = req.body;

  // Basic validation
  if (!levelOfEntry && !year) {
    return res.status(400).json({ message: 'At least one of level_of_entry or year is required.' });
  }

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

  try {
    const [results] = await db.query(query, queryParams);
    if (results.length === 0) {
      console.log('No records found for level_of_entry:', levelOfEntry, 'and year:', year);
      return res.status(404).json({ message: 'No records found.' });
    } else {
      console.log('Query results:', results);
      return res.status(200).json(results);
    }
  } catch (error) {
    console.error('Database query error:', error.message);
    return res.status(500).json({ message: 'Database error' });
  }
};



export const getStudentLevelDistribution = async (req, res) => {
  const query = `
    SELECT level_of_entry, COUNT(*) AS count
    FROM student
    GROUP BY level_of_entry
  `;

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database query error: ' + err.message });
  }
};
