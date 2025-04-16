import express from 'express'
import { createPayRoll ,getEmployeeSalary,getAllEmployeeSalary,deletePayroll, getEmailText} from '../controllers/payRollController.js';

const router=express.Router()

router.post('/addPayroll',createPayRoll)
router.get('/singlePayroll/:employee_id',getEmployeeSalary)
router.get('/payroll_list',getAllEmployeeSalary)
router.delete('/payroll_delete/:id',deletePayroll)
router.get('/message',getEmailText)

export { router as payrollRouter};