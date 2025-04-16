import express from 'express'
import { createParticipant, getAllStudentParticipant } from '../controllers/awardParticipants.js'
// import { requireAuth, requireAdmin } from '../middlewares/verifyJwt.js'
import { authenticateJWT,isAdmin } from '../middlewares/verifyJwt.js'
const router = express.Router()

router.post('/create',authenticateJWT,isAdmin, createParticipant)
router.get('/viewParticipant',authenticateJWT, getAllStudentParticipant)

export { router as awardParticipantsRouter };