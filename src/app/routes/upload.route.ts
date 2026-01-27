import express from 'express';
import { uploadVideo, deleteVideo } from '../controllers/upload.controller';
import { upload } from '../utils/multerConfig';

const router = express.Router();

// Upload single video
router.post('/video', upload.single('video'), uploadVideo);

// Delete video
router.delete('/video', deleteVideo);

export default router;
