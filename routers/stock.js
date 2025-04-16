import express from 'express'
import { createStock, deleteStock, getAllTheStock,getSingleStock,updateStock } from '../controllers/stockController.js'
const router = express.Router()

router.post('/create_stock', createStock)
router.get('/stock_list', getAllTheStock)
router.delete('/delete_stock/:id', deleteStock)
router.get('/single_items/:id', getSingleStock)
router.put('/update_items/:id', updateStock)


export { router as stockRouter };