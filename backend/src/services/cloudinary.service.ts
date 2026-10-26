import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { env } from '../config/env';

// Initialize Cloudinary if credentials are provided in environment
if (env.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  console.log('[Cloudinary] Initialized with cloud_name:', env.cloudinary.cloudName);
} else {
  console.log('[Cloudinary] Credentials not set in .env — using local disk storage fallback');
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}

export class CloudinaryService {
  /**
   * Upload an image file from local disk to Cloudinary
   * Returns Cloudinary secure HTTPS URL, or null if Cloudinary is not configured / fails
   */
  static async uploadImage(
    filePath: string,
    subfolder = 'evidence'
  ): Promise<CloudinaryUploadResult | null> {
    if (!env.cloudinary.isConfigured) {
      return null;
    }

    try {
      const folderPath = `${env.cloudinary.folder}/${subfolder}`;
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folderPath,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }, // Automatic WebP/AVIF delivery & compression
        ],
      });

      // Optionally clean up local file after successful Cloudinary upload
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupErr) {
        // Non-critical local file cleanup error
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('[Cloudinary] Upload failed, falling back to local file:', error);
      return null;
    }
  }

  /**
   * Delete an image from Cloudinary by public ID
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    if (!env.cloudinary.isConfigured || !publicId) {
      return false;
    }

    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (error) {
      console.error('[Cloudinary] Delete failed:', error);
      return false;
    }
  }

  /**
   * Returns whether Cloudinary is active
   */
  static isEnabled(): boolean {
    return env.cloudinary.isConfigured;
  }
}
