import db from '../config/db.js';


export const uploadCertificates = (req, res) => {
    const { employee_id } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    let sql = "INSERT INTO employee_certificates (employee_id, certificate_name, certificate_file) VALUES ?";
    let values = files.map((file) => [employee_id, file.originalname, file.filename]);

    db.query(sql, [values], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${files.length} Certificates uploaded successfully` });
    });


}
export const getEmployeeWithCertificates = (req, res) => {
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

    db.query(sql, [employeeId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No employee found with this ID" });
        }

        // Transform data: Group certificates under a single employee object
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
                .filter(row => row.certificate_id) // Exclude null certificates
                .map(row => ({
                    id: row.certificate_id,
                    certificate_name: row.certificate_name,
                    certificate_file: row.certificate_file
                }))
        };

        res.json(employeeData);
    });
};
export const deleteCertificate=(req,res)=>{
    const { id } = req.params;
    const sql = `DELETE FROM employee_certificates WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Server error', err });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "certificate not found" });
        }
        res.status(200).json({ message: "certificate deleted successfully" });
    });
}