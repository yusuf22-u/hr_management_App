import express from 'express'
import { createCenter, deleteParticipant, getCenterWithStudent, getParticipantById, getSingleParticipant, updateParticipan } from '../controllers/centerForm.js'
import { isAdmin,authenticateJWT } from '../middlewares/verifyJwt.js'

const router = express.Router()
router.post('/create',authenticateJWT,createCenter)
router.get('/',authenticateJWT,getCenterWithStudent)
router.get('/:id',authenticateJWT,getParticipantById)
router.delete('/:id',authenticateJWT,deleteParticipant)
router.get('/edit/:id',authenticateJWT,getSingleParticipant)
router.put('/update/:id',authenticateJWT,updateParticipan)


export { router as centerformRouter }