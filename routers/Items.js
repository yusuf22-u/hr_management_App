import express from 'express';
import { isAdmin,authenticateJWT } from '../middlewares/verifyJwt.js';
import { createItems,getAllItems,getItemById,deleteItems,updateItem, exportItemsToExcel } from '../controllers/itemsController.js';
import { upload } from '../utils/cloudinary.js';
const router = express.Router();




router.post('/create', (req, res, next) => {
    req.folder = 'inventory'; // 👈 dynamic folder here
    next();
}, authenticateJWT,isAdmin, upload.single('image_url'), createItems);
router.put('/update_item/:id',
    authenticateJWT,     // ✅ First: verify the JWT token
               // ✅ Then: check if the user is an admin
    (req, res, next) => {
        req.folder = 'inventory';  // ✅ Now add any custom logic
        next();
    },
    upload.single('image_url'),   // ✅ Then handle file upload
    updateItem                    // ✅ Finally call the controller
);

// router.post('/create', uploadMiddleware, createItems);
// router.put('/update_item/:id', uploadMiddleware, updateItem);
router.get('/item_list',getAllItems)
router.get("/getItem/:id",getItemById)
router.delete("/deleteItem/:id",deleteItems)
router.get('/donwload_items',exportItemsToExcel)

export { router as itemsRouter };
