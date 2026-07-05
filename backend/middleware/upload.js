import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

// Build a Cloudinary storage engine for a given folder (e.g. 'packages' or 'gallery')
const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `matrika-treks/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      // Keep images reasonably sized on the way in
      transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
    },
  });

const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default

export const uploadPackageImages = multer({
  storage: makeStorage('packages'),
  limits: { fileSize: maxFileSize },
}).array('images', 10);

export const uploadGalleryImages = multer({
  storage: makeStorage('gallery'),
  limits: { fileSize: maxFileSize },
}).array('images', 10);