// employeeRouter.js
import express from 'express';

import path from 'path';
import { createEmployee, updateEmployee, getEmployeeById, deleteEmployee, getAllEmployees, getEmployeeDistribution } from '../controllers/employeeController.js'; // Adjust the path according to your project structure
import { isAdmin, authenticateJWT } from '../middlewares/verifyJwt.js';
const router = express.Router();
import { upload } from '../utils/cloudinary.js';


router.post('/createEmployee', (req, res, next) => {
    req.folder = 'employee_profiles'; // 👈 dynamic folder here
    next();
}, authenticateJWT,isAdmin, upload.single('profile_pic'), createEmployee);
router.put('/updateEmployee/:employee_id', (req, res, next) => {
    req.folder = 'employee_profiles'; // 👈 dynamic folder here
    next()
}, authenticateJWT,isAdmin, upload.single('profile_pic'), updateEmployee)
router.get('/getEmployee', authenticateJWT,isAdmin, getAllEmployees);
router.get('/getSingleEmployee/:employee_id', authenticateJWT,isAdmin, getEmployeeById);
router.delete('/deleteEmployee/:employee_id', authenticateJWT,isAdmin, deleteEmployee);
router.get('/distribution', authenticateJWT,isAdmin, getEmployeeDistribution);


export { router as employeeRouter };
