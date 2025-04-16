import express from 'express'
import multer from 'multer';
import { registerUser, loginUser, logoutUser, getUsers, updateUserRole, deleteUser, getAllUsersHistory, getUserById, updateUserAccount } from '../controllers/usersController.js'
import path from 'path';
import { authenticateJWT, isAdmin } from '../middlewares/verifyJwt.js'
import {upload} from '../middlewares/uploadimage.js'


const router = express.Router()

router.post('/signUp', registerUser);
router.get('/account', authenticateJWT, getUserById);
router.put('/accountUpdate',upload.single("profile"),authenticateJWT,updateUserAccount)


router.post('/login', loginUser)
router.post('/logout', authenticateJWT, logoutUser);
router.get('/users', authenticateJWT, isAdmin, getUsers)
router.put('/update_users/role/:id', authenticateJWT, isAdmin, updateUserRole)
router.delete('/delete_user/:id', authenticateJWT, isAdmin, deleteUser)
router.get('/user/history', authenticateJWT, isAdmin, getAllUsersHistory)

export { router as userRouter };