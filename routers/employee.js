// employeeRouter.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { createEmployee,updateEmployee,getEmployeeById,deleteEmployee,getAllEmployees,getEmployeeDistribution} from '../controllers/employeeController.js'; // Adjust the path according to your project structure
import { isAdmin,authenticateJWT } from '../middlewares/verifyJwt.js';
const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile'); // Directory where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure the file name is unique
  }
});

const upload = multer({ storage: storage });

// Employee creation route
router.post('/createEmployee', upload.single('profile_pic'), createEmployee);
router.put('/updateEmployee/:employee_id',authenticateJWT,upload.single('profile_pic'),updateEmployee)
router.get('/getEmployee', getAllEmployees);
router.get('/getSingleEmployee/:employee_id',authenticateJWT, getEmployeeById);
router.delete('/deleteEmployee/:employee_id',authenticateJWT, deleteEmployee);
router.get('/distribution',authenticateJWT, getEmployeeDistribution);


export { router as employeeRouter };
