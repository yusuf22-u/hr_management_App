import express from 'express'
import { createAllocation,getAssignItem,deleteAllocation,updateReturn } from '../controllers/allocateItem.js';
const router=express.Router()

router.post('/allocate',createAllocation)
router.get('/assign_list',getAssignItem)
router.delete('/delete_allocation/:id',deleteAllocation)
router.put('/return/:id',updateReturn)
export { router as allocateItemRouter};