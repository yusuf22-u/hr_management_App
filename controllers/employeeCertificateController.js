import db from '../config/db.js';
import jwt from 'jsonwebtoken'
export const uploadCertificates = async (req, res) => {
    const { employee_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    let sql = "INSERT INTO employee_certificates (employee_id, certificate_name, certificate_file) VALUES ?";
    let values = files.map((file) => [employee_id, file.originalname, file.filename]);

    try {
        const [result] = await db.query(sql, [values]);
        res.json({ message: `${files.length} Certificates uploaded successfully` });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getEmployeeWithCertificates = async (req, res) => {
    const { employeeId } = req.params;

    const sql = `
        SELECT 
            e.employee_id, e.full_name, e.email, e.address, e.phone_number, 
            e.profile_pic, e.position, e.department, e.date_of_birth, e.date_of_admission,
            c.id AS certificate_id, c.certificate_name, c.certificate_file
        FROM employees e
        LEFT JOIN employee_certificates c ON e.employee_id = c.employee_id
        WHERE e.employee_id = ?;
    `;

    try {
        const [results] = await db.query(sql, [employeeId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No employee found with this ID" });
        }

        const employeeData = {
            employee_id: results[0].employee_id,
            full_name: results[0].full_name,
            email: results[0].email,
            address: results[0].address,
            phone_number: results[0].phone_number,
            profile_pic: results[0].profile_pic,
            position: results[0].position,
            department: results[0].department,
            date_of_birth: results[0].date_of_birth,
            date_of_admission: results[0].date_of_admission,
            certificates: results
                .filter(row => row.certificate_id) 
                .map(row => ({
                    id: row.certificate_id,
                    certificate_name: row.certificate_name,
                    certificate_file: row.certificate_file
                }))
        };

        res.json(employeeData);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteCertificate = async (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM employee_certificates WHERE id = ?`;

    try {
        const [result] = await db.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Certificate not found" });
        }
        res.status(200).json({ message: "Certificate deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: 'Server error', err });
    }
};

export const getEmployeeFiles = async (req, res) => {
    // Extract employee_id from the JWT token (assuming it's in the 'Authorization' header)
    const token = req.headers['authorization']?.split(' ')[1];  // Assumes 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Decode the token to get the employee_id (assumes the token includes employee_id)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { employee_id } = decoded; 
        
        // SQL query to fetch employee details along with their certificates
        const sql = `
            SELECT 
                e.employee_id, e.full_name, e.email, e.address, e.phone_number, 
                e.profile_pic, e.position, e.department, e.date_of_birth, e.date_of_admission,
                c.id AS certificate_id, c.certificate_name, c.certificate_file
            FROM employees e
            LEFT JOIN employee_certificates c ON e.employee_id = c.employee_id
            WHERE e.employee_id = ?;
        `;

        // Fetch employee data from the database
        const [results] = await db.query(sql, [employee_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No employee found with this ID" });
        }

        // Prepare the employee data with certificates grouped under a single object
        const employeeData = {
            employee_id: results[0].employee_id,
            full_name: results[0].full_name,
            email: results[0].email,
            address: results[0].address,
            phone_number: results[0].phone_number,
            profile_pic: results[0].profile_pic,
            position: results[0].position,
            department: results[0].department,
            date_of_birth: results[0].date_of_birth,
            date_of_admission: results[0].date_of_admission,
            certificates: results
                .filter(row => row.certificate_id)  // Exclude null certificates
                .map(row => ({
                    id: row.certificate_id,
                    certificate_name: row.certificate_name,
                    certificate_file: row.certificate_file
                }))
        };

        // Send the employee data as response
        res.json(employeeData);
    } catch (err) {
        console.error('Error decoding token:', err);
        return res.status(500).json({ error: 'Failed to authenticate user' });
    }
};
