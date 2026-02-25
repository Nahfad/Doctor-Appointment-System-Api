import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

config();

cloudinary.config({
    cloud_name: process.env.CLOADINARY_NAME,
    api_key: process.env.CLOADINARY_API_KEY,
    api_secret: process.env.CLOADINARY_SECRET_KEY,
});

export default cloudinary;
