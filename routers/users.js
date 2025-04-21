import express from 'express'
import multer from 'multer';
import { registerUser, loginUser, logoutUser, getUsers, updateUserRole, deleteUser, getAllUsersHistory, getUserById, updateUserAccount } from '../controllers/usersController.js'
import path from 'path';
import { authenticateJWT, isAdmin } from '../middlewares/verifyJwt.js'
import { upload } from '../utils/cloudinary.js';



const router = express.Router()

router.post('/signUp',
    (req, res, next) => {
      req.folder = 'users_profiles'; // Dynamic folder for Cloudinary
      next();
    },
    upload.single('profile'), // This parses req.body and req.file
    registerUser
  );
router.get('/account', authenticateJWT, getUserById);
router.put('/accountUpdate',
    authenticateJWT, // ✅ should come before the upload
    (req, res, next) => {
      req.folder = 'users_profiles'; 
      next();
    },
    upload.single("profile"),
    updateUserAccount
  );
  
router.post('/login', loginUser)
router.post('/logout', authenticateJWT, logoutUser);
router.get('/users', authenticateJWT, isAdmin, getUsers)
router.put('/update_users/role/:id', authenticateJWT, isAdmin, updateUserRole)
router.delete('/delete_user/:id', authenticateJWT, isAdmin, deleteUser)
router.get('/user/history', authenticateJWT, isAdmin, getAllUsersHistory)

export { router as userRouter };