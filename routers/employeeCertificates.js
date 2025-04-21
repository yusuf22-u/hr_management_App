
import express from 'express'

import { upload as uploadCerts } from '../utils/cloudinary.js';
import { authenticateJWT, isAdmin } from '../middlewares/verifyJwt.js'
import { deleteCertificate, getEmployeeFiles, getEmployeeWithCertificates, uploadCertificates } from '../controllers/employeeCertificateController.js';

const router = express.Router()




router.post(
    '/upload_certificate', authenticateJWT, isAdmin,
    (req, res, next) => {
        req.folder = `employee_certificates/${req.body.employee_id}`;
        next();
    },
    uploadCerts.array('certificate_files', 10), // Use uploadCerts here
    uploadCertificates
);
router.get("/view/:employeeId", authenticateJWT, getEmployeeWithCertificates)
router.delete("/deleteCertificate/:id", authenticateJWT, isAdmin, deleteCertificate)
router.get("/personalFiles", getEmployeeFiles)


export { router as employeeCertificatesRouter };
