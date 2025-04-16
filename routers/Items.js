import express from 'express';
import path from 'path';
import multer from 'multer';
import { createItems,getAllItems,getItemById,deleteItems,updateItem } from '../controllers/itemsController.js';

const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/items'); // Directory where images will be saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure the file name is unique
    }
});

// Set up Multer file filter to allow only jpg, jpeg, and png files
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpg|jpeg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
}).single('image_url');

// Middleware to handle file upload errors
const uploadMiddleware = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Handle Multer-specific errors (e.g., file size limit)
            return res.status(400).json({ success: false, error: err.message });
        } else if (err) {
            // Handle any other errors
            return res.status(400).json({ success: false, error: err.message });
        }
        // Proceed to the next middleware if no errors
        next();
    });
};

router.post('/create', uploadMiddleware, createItems);
router.put('/update_item/:id', uploadMiddleware, updateItem);
router.get('/item_list',getAllItems)
router.get("/getItem/:id",getItemById)
router.delete("/deleteItem/:id",deleteItems)

export { router as itemsRouter };
