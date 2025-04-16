import express from 'express';
import multer from 'multer';
import path from 'path';
import { createStudent,getAllStudents,deleteStudent,getStudentById,updateStudent,getGenderAndMaritalStatusCounts,getStudentsByFilter, getStudentLevelDistribution } from '../controllers/studentController.js';
import { isAdmin, authenticateJWT } from '../middlewares/verifyJwt.js';
const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/student'); // Directory where images will be saved
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
  limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});

// Student creation route
router.post('/createStudent',authenticateJWT,isAdmin, upload.single('profile_pic'), createStudent);
router.put('/updateStudent/:id', authenticateJWT, isAdmin, upload.single('profile_pic'), updateStudent);

router.get('/allStudents',authenticateJWT, getAllStudents);
router.delete('/delete_Student/:id', authenticateJWT, isAdmin, deleteStudent);

// router.delete('/deleteEmployee/:id', deleteEmployee);
router.get('/getStudent/:id',authenticateJWT, getStudentById);
router.get('/genderMaritalStatusCounts',authenticateJWT, getGenderAndMaritalStatusCounts);
router.post('/search',getStudentsByFilter)
router.get('/level',authenticateJWT,getStudentLevelDistribution)

export { router as studentRouter };
