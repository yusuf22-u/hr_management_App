// employeeRouter.js
import express from 'express';
import { createStaffEvaluation,getEmployeeEvaluations,getStaffOfTheMonth,getScoreDistribution, getEmployeeEvaluationsByID, getSingleEmployeeEvaluationByID } from '../controllers/staffEvaluation.js';
import { isAdmin,authenticateJWT } from '../middlewares/verifyJwt.js';

const router = express.Router();


router.post('/create', authenticateJWT,isAdmin, createStaffEvaluation);

// Staff evaluation view route (admin only)
router.get('/view', authenticateJWT, isAdmin, getEmployeeEvaluations);
router.get("/staffOfTheMonth",authenticateJWT,isAdmin, getStaffOfTheMonth);
router.get("/scoreDistribution",authenticateJWT,isAdmin, getScoreDistribution);
router.get("/rates/:id",authenticateJWT,isAdmin,getEmployeeEvaluationsByID)
router.get("/:id",authenticateJWT,isAdmin,getSingleEmployeeEvaluationByID)


export { router as staffEvaluationRouter };
