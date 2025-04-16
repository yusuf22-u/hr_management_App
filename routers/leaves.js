import express from 'express'
import {deleteNotification, updateLeaveRequest,createLeaveRequest,getLeaveRequests,getNotifications,markNotificationAsRead, getMassage, notifyUsers, userMessageAsRead, deleteMessage} from '../controllers/LeaveController.js';
import { authenticateJWT,isAdmin } from '../middlewares/verifyJwt.js';

const router = express.Router();

// Create leave request
router.post('/create',authenticateJWT, createLeaveRequest);

// Get leave requests
router.get('/leave-requests',authenticateJWT, getLeaveRequests);

// Update leave request
router.put('/update/:id',authenticateJWT, updateLeaveRequest);

// Get notifications
router.get('/notifications',authenticateJWT, getNotifications);
router.get('/inbox',authenticateJWT, getMassage);
router.get('/notify',authenticateJWT, notifyUsers);

// Mark notification as read
router.put('/notification/:id',authenticateJWT, markNotificationAsRead);
router.put('/markUserAsRead/:id',authenticateJWT, userMessageAsRead);
router.delete('/delete/:id',authenticateJWT, deleteNotification);
router.delete('/deleteMessage/:id',authenticateJWT, deleteMessage);





export { router as leaveRouter};