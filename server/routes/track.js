import express from 'express';
import { getAllTracks, getMyTracks, getTrackById, createTrack, deleteTrack } from '../controllers/track.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, getAllTracks); // admin usage
router.get('/', protect, getMyTracks); // logged-in user tracks
router.get('/:id', protect, getTrackById);
router.post('/', protect, createTrack);
router.delete('/:id', protect, deleteTrack);

export default router;
