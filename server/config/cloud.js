const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'smart-evaluation',
      resource_type: 'auto',
    });
    
    logger.info('Image uploaded successfully:', result.secure_url);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    logger.error('Image upload failed:', error);
    throw new Error('Image upload failed');
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info('Image deleted successfully:', publicId);
  } catch (error) {
    logger.error('Image deletion failed:', error);
    throw new Error('Image deletion failed');
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
