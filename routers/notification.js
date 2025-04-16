import express from 'express'
import { markNotificationRead, notificationMessage } from '../controllers/notificationController.js';
import {isAdmin,authenticateJWT} from '../middlewares/verifyJwt.js'
const router=express.Router()

router.put('/mark-read/:id',authenticateJWT,isAdmin, markNotificationRead);
router.get('/inbox',authenticateJWT,isAdmin, notificationMessage);

export { router as notificationRouter};