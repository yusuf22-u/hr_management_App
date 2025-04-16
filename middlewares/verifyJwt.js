import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/db.js'; // Adjust the path based on your project structure

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate JWT token and attach user data to request.
 */
export const authenticateJWT = (req, res, next) => {
    let token = req.cookies.token;

    // Check if token is in the Authorization header if not in cookies
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];  // Extract the token from 'Bearer <token>'
        }
    }

    // If no token is found, deny access
    if (!token) {
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;  // Attach decoded user data (including employee_id & role) to the request object

        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        return res.status(403).json({ error: 'Could not authenticate token.' });
    }
};

/**
 * Middleware to check if user is an Admin
 */
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

/**
 * Middleware to check if user is an Award Manager
 */
export const isAwardManager = (req, res, next) => {
    if (req.user.role !== 'award') {
        return res.status(403).json({ error: 'Access denied. Award Managers only.' });
    }
    next();
};
