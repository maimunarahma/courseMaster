import express from 'express';
import { askCourseQuestion, getChatHistory, clearChatHistory } from '../controllers/chat.controller';

const router = express.Router();

// Ask a question about the course
router.post('/ask/:courseId', askCourseQuestion);

// Get chat history for a course
router.get('/history/:courseId', getChatHistory);

// Clear chat history for a course
router.delete('/history/:courseId', clearChatHistory);

export const chatRoutes = router;
