import express from 'express';
const router = express.Router();
import { addStudentScore,getStudentScores,getALLStudentScores,deleteScore,updateStudentScore,getStudentScore } from '../controllers/studentScore.js';

// POST route to add a new student score
router.post('/add-student-score', addStudentScore);
router.get('/mark/:id',getStudentScores)
router.get('/grade-list',getALLStudentScores)
router.delete('/delete/:id',deleteScore)
router.put('/updateStudentScore/:id', updateStudentScore);
router.get('/get_student/:id',getStudentScore)



export { router as studentScoreRouter };
