import { v2 as cloudinary } from 'cloudinary';

export function uploadImage(buffer, folder) {
  const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter(key => !process.env[key]);
  if (missing.length) throw new Error(`Cloudinary is not configured. Missing: ${missing.join(', ')}`);
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', use_filename: true, unique_filename: true },
      (error, result) => error ? reject(error) : resolve(result),
    );
    stream.end(buffer);
  });
}

export function uploadMedia(buffer, folder, resourceType = 'auto') {
  const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter(key => !process.env[key]);
  if (missing.length) throw new Error(`Cloudinary is not configured. Missing: ${missing.join(', ')}`);
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, use_filename: true, unique_filename: true },
      (error, result) => error ? reject(error) : resolve(result),
    );
    stream.end(buffer);
  });
}
