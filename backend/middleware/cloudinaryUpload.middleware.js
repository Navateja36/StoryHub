import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Configure Cloudinary using your .env variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// 2. Configure the storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'storyhub-posts', // This is the folder name in your Cloudinary account
    allowed_formats: ['jpeg', 'png', 'jpg'], // Specify allowed image formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: basic image processing
  },
});

// 3. Create the upload middleware instance
const upload = multer({ storage: storage });

export default upload;