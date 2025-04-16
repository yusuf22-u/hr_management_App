
import express from 'express'
import multer from 'multer';

import { authenticateJWT, isAdmin } from '../middlewares/verifyJwt.js'
import { deleteCertificate, getEmployeeWithCertificates, uploadCertificates } from '../controllers/employeeCertificateController.js';

const router = express.Router()


// Configure Multer for multiple file uploads
const storage = multer.diskStorage({
    destination: "./uploads/certificate/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

// Route to upload multiple certificates
router.post("/addCertificates", upload.array("certificate_files", 5),uploadCertificates)
router.get("/view/:employeeId",getEmployeeWithCertificates)
router.delete("/deleteCertificate/:id",deleteCertificate)


export { router as employeeCertificatesRouter };
