import express from 'express'
import { createStock, deleteStock, getAllTheStock,getSingleStock,updateStock } from '../controllers/stockController.js'
import {authenticateJWT,isAdmin} from '../middlewares/verifyJwt.js'
const router = express.Router()

router.post('/create_stock',authenticateJWT,isAdmin, createStock)
router.get('/stock_list',authenticateJWT,isAdmin, getAllTheStock)
router.delete('/delete_stock/:id',authenticateJWT,isAdmin, deleteStock)
router.get('/single_items/:id',authenticateJWT,isAdmin, getSingleStock)
router.put('/update_items/:id',authenticateJWT,isAdmin, updateStock)


export { router as stockRouter };