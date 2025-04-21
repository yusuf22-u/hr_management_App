import express from 'express'
import { createPayRoll ,getEmployeeSalary,getAllEmployeeSalary,deletePayroll, getEmailText, exportNominalRollToExcel, NominalRoll} from '../controllers/payRollController.js';
import { authenticateJWT,isAdmin } from '../middlewares/verifyJwt.js';

const router=express.Router()

router.post('/addPayroll',authenticateJWT,isAdmin,createPayRoll)
router.get('/singlePayroll/:employee_id',authenticateJWT,isAdmin,getEmployeeSalary)
router.get('/payroll_list',authenticateJWT,isAdmin,getAllEmployeeSalary)
router.delete('/payroll_delete/:id',authenticateJWT,isAdmin,deletePayroll)
router.get('/message',authenticateJWT,isAdmin,getEmailText)
router.get('/export-nominal-roll', exportNominalRollToExcel);
router.get('/nominal-roll',authenticateJWT,isAdmin,NominalRoll)

export { router as payrollRouter};