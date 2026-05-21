import { sql } from "../config/db.js";

// Get all reviews for a movie
export const getMovieReview = async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);

    const reviewsQuery = await sql`
      SELECT 
        r.reviewid,
        r.rating,
        r.reviewtext as text,
        r.reviewdate as date,
        u.username
      FROM moviereview r
      JOIN systemuser u ON r.username = u.username
      WHERE r.movieid = (SELECT movieid
      FROM movie
      WHERE mediaid = ${movieId}  
      ) AND u.role='user'
      ORDER BY r.reviewdate DESC
    `;

    return res.status(200).json({
      success: true,
      data: reviewsQuery
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const { rating, text, username } = req.body;

    // Validate input
    if (!rating || !text || !username) {
      return res.status(400).json({
        success: false,
        message: 'Rating, text, and userId are required'
      });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 10'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await sql`
      SELECT * FROM moviereview
      WHERE username = ${username} AND movieid = 
      (SELECT movieid FROM movie WHERE mediaid = ${movieId})
    `;

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie'
      });
    }




    const movieRow = await sql`
  SELECT movieid FROM movie WHERE mediaid = ${movieId}
`;

if (movieRow.length === 0) {
  return res.status(404).json({ success: false, message: "Movie not found" });
}

const actualMovieId = movieRow[0].movieid;




    // Insert new review
    const newReview = await sql`
      INSERT INTO moviereview (movieid,username, rating, reviewtext)
      VALUES (${actualMovieId}, ${username}, ${rating}, ${text})
      RETURNING reviewid, rating, reviewtext as text, reviewdate as date, username
    `;

    const avgRatingResult = await sql`
      SELECT AVG(rating) as averageRating
      FROM moviereview
      WHERE movieid = ${actualMovieId}  
    `;
    const newAvgRating = Number(avgRatingResult[0].averagerating).toFixed(2);

    await sql`
      UPDATE media
      SET rating = ${newAvgRating}
      WHERE mediaid = ${movieId}  
    `;


    
   

    const reviewData = {
      ...newReview[0]
      
  
    };

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data:
      {
        review:newReview[0],
        newMovieRating:newAvgRating,
        
      }
    });

      
  
  }
   catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// Update a review
export const updateReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const { rating, text } = req.body;
    const username = req.user.username;

    // Validate input
    if (!rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Rating and text are required'
      });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 10'
      });
    }

    // Check if review exists and belongs to user
    const existingReview = await sql`
      SELECT * FROM moviereview
      WHERE reviewid = ${reviewId} AND username = ${username}
    `;

    if (existingReview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to update it'
      });
    }

    // Update the review
    const updatedReview = await sql`
      UPDATE moviereview
      SET rating = ${rating}, reviewtext = ${text}
      WHERE reviewid = ${reviewId}
      RETURNING reviewid, rating, reviewtext as text, reviewdate as date, username
    `;

    // Get the movieid from the review
    const movieIdFromReview = existingReview[0].movieid;

    // Get the mediaid from movie table
    const mediaIdRow = await sql`
      SELECT mediaid FROM movie WHERE movieid = ${movieIdFromReview}
    `;

    if (mediaIdRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const mediaId = mediaIdRow[0].mediaid;

    // Recalculate movie average rating
    const avgRatingResult = await sql`
      SELECT AVG(rating) as avg_rating
      FROM moviereview
      WHERE movieid = ${movieIdFromReview}
    `;

    const newAvgRating = Number(avgRatingResult[0].avg_rating).toFixed(2);

    // Update movie rating in media table using mediaid
    await sql`
      UPDATE media
      SET rating = ${newAvgRating}
      WHERE mediaid = ${mediaId}
    `;

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: updatedReview[0],
        newMovieRating: newAvgRating
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const username = req.user.username;

    
    const existingReview = await sql`
      SELECT * FROM moviereview
      WHERE reviewid = ${reviewId} AND username = ${username}
    `;

    if (existingReview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    
    const movieIdFromReview = existingReview[0].movieid;

    // Get the mediaid from movie table
    const mediaIdRow = await sql`
      SELECT mediaid FROM movie WHERE movieid = ${movieIdFromReview}
    `;

    if (mediaIdRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    const mediaId = mediaIdRow[0].mediaid;

    // Delete the review
    await sql`
      DELETE FROM moviereview
      WHERE reviewid = ${reviewId}
    `;

    // Recalculate movie average rating
    const avgRatingResult = await sql`
      SELECT AVG(rating) as avg_rating
      FROM moviereview
      WHERE movieid = ${movieIdFromReview}
    `;

    const newAvgRating = avgRatingResult[0].avg_rating 
      ? Number(avgRatingResult[0].avg_rating).toFixed(2) 
      : 0; // If no reviews left, rating is 0

    // Update movie rating in media table using mediaid
    await sql`
      UPDATE media
      SET rating = ${newAvgRating}
      WHERE mediaid = ${mediaId}
    `;

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        newMovieRating: newAvgRating
      }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};