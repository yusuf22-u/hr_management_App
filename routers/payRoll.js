import express from 'express'
import { createPayRoll ,getEmployeeSalary,getAllEmployeeSalary,deletePayroll, getEmailText} from '../controllers/payRollController.js';
import { authenticateJWT,isAdmin } from '../middlewares/verifyJwt.js';

const router=express.Router()

router.post('/addPayroll',createPayRoll,authenticateJWT,isAdmin)
router.get('/singlePayroll/:employee_id',getEmployeeSalary,authenticateJWT,isAdmin)
router.get('/payroll_list',getAllEmployeeSalary,authenticateJWT,isAdmin)
router.delete('/payroll_delete/:id',deletePayroll,authenticateJWT,isAdmin)
router.get('/message',getEmailText,authenticateJWT,isAdmin)

export { router as payrollRouter};