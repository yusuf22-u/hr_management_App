import express from 'express'
import {userLogin} from '../controllers/userLogin.js'
const router=express.Router()

router.post('/login',userLogin)

export { router as userLoginRouter};