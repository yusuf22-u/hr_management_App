import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This supports dynamic folder selection
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.folder || 'default_folder'; // fallback if not set
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});
const certificateStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.folder || 'employee_certificates';
    return {
      folder,
      resource_type: 'auto', // important to handle PDFs, docs, etc.
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'docx'],
    };
  },
});

const upload = multer({ storage: storage }); // Default image upload
const uploadCertificates = multer({ storage: certificateStorage }); // For docs

// const upload = multer({ storage });

export { cloudinary, upload,uploadCertificates };
