import express from 'express';
import { getSites, getSiteByName, getSitesByType, createSite, deleteSite } from '../controllers/site.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSites);
router.get('/name/:name', getSiteByName);
router.get('/type/:type', getSitesByType);
router.post('/', protect, createSite);
router.delete('/:id', protect, deleteSite);

export default router;
