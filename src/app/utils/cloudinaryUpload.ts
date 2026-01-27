import cloudinary from '../../cloudinary';
import { UploadApiResponse } from 'cloudinary';

interface VideoUploadResult {
  url: string;
  duration: number; // in seconds
  publicId: string;
}

/**
 * Upload video to Cloudinary and extract duration automatically
 * @param filePath - Local file path or buffer
 * @param folder - Cloudinary folder name (optional)
 * @returns Object containing video URL and duration in seconds
 */
export const uploadVideoToCloudinary = async (
  filePath: string,
  folder: string = 'course-videos'
): Promise<VideoUploadResult> => {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: folder,
      quality: 'auto',
      eager: [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto', format: 'mp4' }
      ],
      eager_async: true
    });

    return {
      url: result.secure_url,
      duration: result.duration || 0, // Cloudinary automatically provides duration in seconds
      publicId: result.public_id
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload video: ${error.message}`);
  }
};

/**
 * Delete video from Cloudinary
 * @param publicId - Cloudinary public ID of the video
 */
export const deleteVideoFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete video: ${error.message}`);
  }
};

/**
 * Get video duration from Cloudinary URL (for already uploaded videos)
 * @param publicId - Cloudinary public ID
 */
export const getVideoDuration = async (publicId: string): Promise<number> => {
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: 'video' });
    return result.duration || 0;
  } catch (error: any) {
    console.error('Error fetching video duration:', error);
    throw new Error(`Failed to get video duration: ${error.message}`);
  }
};
