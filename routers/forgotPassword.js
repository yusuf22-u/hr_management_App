import express from 'express'
import {registerUser} from '../controllers/usersController.js'
const router=express.Router()

router.post('/forgotPassword',registerUser)

export { router as forgotPasswordRouter};