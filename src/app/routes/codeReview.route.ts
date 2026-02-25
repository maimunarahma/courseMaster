import express from 'express';
import { submitCodeForReview, quickCodeReview } from '../controllers/codeReview.controller';

const router = express.Router();

// Submit code for review (course-specific)
router.post('/submit/:courseId', submitCodeForReview);

// Quick code review (no course context)
router.post('/quick', quickCodeReview);

export const codeReviewRoutes = router;
