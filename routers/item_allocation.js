import express from 'express'
import {isAdmin,authenticateJWT} from '../middlewares/verifyJwt.js'
import { createAllocation,getAssignItem,deleteAllocation,updateReturn } from '../controllers/allocateItem.js';
const router=express.Router()

router.post('/allocate',createAllocation)
router.get('/assign_list',authenticateJWT,isAdmin,getAssignItem)
router.delete('/delete_allocation/:id',authenticateJWT,isAdmin,deleteAllocation)
router.put('/return/:id',authenticateJWT,isAdmin,updateReturn)
export { router as allocateItemRouter};