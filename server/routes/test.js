import express from 'express';
import { testScraper } from '../controllers/test.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, testScraper);

export default router;
