import express from 'express';
import { 
  createReview, 
  getMovieReview, 
  updateReview, 
  deleteReview 
} from '../controllers/movieReviewController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/movies/:movieId/reviews', verifyToken, createReview);
router.get('/movies/:movieId/reviews', getMovieReview);
router.put('/reviews/:reviewId', verifyToken, updateReview); // 
router.delete('/reviews/:reviewId', verifyToken, deleteReview); //

export default router;