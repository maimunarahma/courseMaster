import { Request, Response } from 'express';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary } from '../utils/cloudinaryUpload';
import fs from 'fs/promises';

/**
 * Upload a single video to Cloudinary
 * Automatically extracts duration
 */
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // Upload to Cloudinary
    const result = await uploadVideoToCloudinary(req.file.path, 'course-videos');

    // Delete temporary file
    await fs.unlink(req.file.path);

    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        videoUrl: result.url,
        duration: result.duration,
        publicId: result.publicId
      }
    });
  } catch (error: any) {
    console.error('Upload video error:', error);
    
    // Clean up temporary file if exists
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
    }

    return res.status(500).json({
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

/**
 * Delete a video from Cloudinary
 */
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    await deleteVideoFromCloudinary(publicId);

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete video error:', error);
    return res.status(500).json({
      message: 'Failed to delete video',
      error: error.message
    });
  }
};
