import { sql } from "../config/db.js";

// Get all reviews for an episode
export const getEpisodeReviews = async (req, res) => {
  try {
    const episodeId = Number(req.params.episodeId);

    const reviewsQuery = await sql`
      SELECT 
        r.reviewid,
        r.rating,
        r.reviewtext as text,
        r.reviewdate as date,
        u.username
      FROM episodereview r
      JOIN systemuser u ON r.username = u.username
      WHERE r.episodeid = ${episodeId} AND u.role='user'
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

// Create episode review
export const createEpisodeReview = async (req, res) => {
  try {
    const episodeId = Number(req.params.episodeId);
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

    // Check if user already reviewed this episode
    const existingReview = await sql`
      SELECT * FROM episodereview
      WHERE episodeid = ${episodeId} AND username = ${username}
    `;

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this episode'
      });
    }

    // Insert new review
    const newReview = await sql`
      INSERT INTO episodereview (episodeid, username, rating, reviewtext)
      VALUES (${episodeId}, ${username}, ${rating}, ${text})
      RETURNING reviewid, rating, reviewtext as text, reviewdate as date, username
    `;

    //  STEP 1: Calculate and update EPISODE average rating
    const episodeAvgQuery = await sql`
      SELECT AVG(rating) as avgRating
      FROM episodereview
      WHERE episodeid = ${episodeId}
    `;
    const episodeAvg = Number(episodeAvgQuery[0].avgrating).toFixed(2);

    await sql`
      UPDATE episode
      SET avgrating = ${episodeAvg}
      WHERE episodeid = ${episodeId}
    `;

    // STEP 2: Get seasonid and calculate SEASON average rating (avg of all episode ratings)
    const seasonIdQuery = await sql`
      SELECT seasonid FROM episode WHERE episodeid = ${episodeId}
    `;
    const seasonId = seasonIdQuery[0].seasonid;

    const seasonAvgQuery = await sql`
      SELECT AVG(avgrating) as seasonAvg
      FROM episode
      WHERE seasonid = ${seasonId}
    `;
    const seasonAvg = Number(seasonAvgQuery[0].seasonavg).toFixed(2);

    await sql`
      UPDATE season
      SET avgrating = ${seasonAvg}
      WHERE seasonid = ${seasonId}
    `;

    //  STEP 3: Get seriesid and calculate SERIES average rating (avg of all season ratings)
    const seriesIdQuery = await sql`
      SELECT seriesid FROM season WHERE seasonid = ${seasonId}
    `;
    const seriesId = seriesIdQuery[0].seriesid;

    const seriesAvgQuery = await sql`
      SELECT AVG(avgrating) as seriesAvg
      FROM season
      WHERE seriesid = ${seriesId}
    `;
    const seriesAvg = Number(seriesAvgQuery[0].seriesavg).toFixed(2);

    // Get mediaid to update
    const mediaIdQuery = await sql`
      SELECT mediaid FROM series WHERE seriesid = ${seriesId}
    `;
    const mediaId = mediaIdQuery[0].mediaid;

    await sql`
      UPDATE media
      SET rating = ${seriesAvg}
      WHERE mediaid = ${mediaId}
    `;

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: newReview[0],
        newEpisodeRating: episodeAvg,
        newSeasonRating: seasonAvg,
        newSeriesRating: seriesAvg
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update episode review
export const updateEpisodeReview = async (req, res) => {
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
      SELECT * FROM episodereview
      WHERE reviewid = ${reviewId} AND username = ${username}
    `;

    if (existingReview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to update it'
      });
    }

    const episodeId = existingReview[0].episodeid;

    // Update review
    const updatedReview = await sql`
      UPDATE episodereview
      SET rating = ${rating}, reviewtext = ${text}
      WHERE reviewid = ${reviewId}
      RETURNING reviewid, rating, reviewtext as text, reviewdate as date, username
    `;

    //  Recalculate cascading ratings (same as create)
    // STEP 1: Episode rating
    const episodeAvgQuery = await sql`
      SELECT AVG(rating) as avgRating
      FROM episodereview
      WHERE episodeid = ${episodeId}
    `;
    const episodeAvg = Number(episodeAvgQuery[0].avgrating).toFixed(2);

    await sql`
      UPDATE episode
      SET avgrating = ${episodeAvg}
      WHERE episodeid = ${episodeId}
    `;

    // STEP 2: Season rating
    const seasonIdQuery = await sql`
      SELECT seasonid FROM episode WHERE episodeid = ${episodeId}
    `;
    const seasonId = seasonIdQuery[0].seasonid;

    const seasonAvgQuery = await sql`
      SELECT AVG(avgrating) as seasonAvg
      FROM episode
      WHERE seasonid = ${seasonId}
    `;
    const seasonAvg = Number(seasonAvgQuery[0].seasonavg).toFixed(2);

    await sql`
      UPDATE season
      SET avgrating = ${seasonAvg}
      WHERE seasonid = ${seasonId}
    `;

    // STEP 3: Series rating
    const seriesIdQuery = await sql`
      SELECT seriesid FROM season WHERE seasonid = ${seasonId}
    `;
    const seriesId = seriesIdQuery[0].seriesid;

    const seriesAvgQuery = await sql`
      SELECT AVG(avgrating) as seriesAvg
      FROM season
      WHERE seriesid = ${seriesId}
    `;
    const seriesAvg = Number(seriesAvgQuery[0].seriesavg).toFixed(2);

    const mediaIdQuery = await sql`
      SELECT mediaid FROM series WHERE seriesid = ${seriesId}
    `;
    const mediaId = mediaIdQuery[0].mediaid;

    await sql`
      UPDATE media
      SET rating = ${seriesAvg}
      WHERE mediaid = ${mediaId}
    `;

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: updatedReview[0],
        newEpisodeRating: episodeAvg,
        newSeasonRating: seasonAvg,
        newSeriesRating: seriesAvg
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

// Delete episode review
export const deleteEpisodeReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    const username = req.user.username;

    // Check if review exists and belongs to user
    const existingReview = await sql`
      SELECT * FROM episodereview
      WHERE reviewid = ${reviewId} AND username = ${username}
    `;

    if (existingReview.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    const episodeId = existingReview[0].episodeid;

    // Delete review
    await sql`
      DELETE FROM episodereview
      WHERE reviewid = ${reviewId}
    `;

    // Recalculate cascading ratings (same as create)
    // STEP 1: Episode rating
    const episodeAvgQuery = await sql`
      SELECT AVG(rating) as avgRating
      FROM episodereview
      WHERE episodeid = ${episodeId}
    `;
    const episodeAvg = episodeAvgQuery[0].avgrating 
      ? Number(episodeAvgQuery[0].avgrating).toFixed(2) 
      : 0;

    await sql`
      UPDATE episode
      SET avgrating = ${episodeAvg}
      WHERE episodeid = ${episodeId}
    `;

    // STEP 2: Season rating
    const seasonIdQuery = await sql`
      SELECT seasonid FROM episode WHERE episodeid = ${episodeId}
    `;
    const seasonId = seasonIdQuery[0].seasonid;

    const seasonAvgQuery = await sql`
      SELECT AVG(avgrating) as seasonAvg
      FROM episode
      WHERE seasonid = ${seasonId}
    `;
    const seasonAvg = seasonAvgQuery[0].seasonavg 
      ? Number(seasonAvgQuery[0].seasonavg).toFixed(2) 
      : 0;

    await sql`
      UPDATE season
      SET avgrating = ${seasonAvg}
      WHERE seasonid = ${seasonId}
    `;

    // STEP 3: Series rating
    const seriesIdQuery = await sql`
      SELECT seriesid FROM season WHERE seasonid = ${seasonId}
    `;
    const seriesId = seriesIdQuery[0].seriesid;

    const seriesAvgQuery = await sql`
      SELECT AVG(avgrating) as seriesAvg
      FROM season
      WHERE seriesid = ${seriesId}
    `;
    const seriesAvg = seriesAvgQuery[0].seriesavg 
      ? Number(seriesAvgQuery[0].seriesavg).toFixed(2) 
      : 0;

    const mediaIdQuery = await sql`
      SELECT mediaid FROM series WHERE seriesid = ${seriesId}
    `;
    const mediaId = mediaIdQuery[0].mediaid;

    await sql`
      UPDATE media
      SET rating = ${seriesAvg}
      WHERE mediaid = ${mediaId}
    `;

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        newEpisodeRating: episodeAvg,
        newSeasonRating: seasonAvg,
        newSeriesRating: seriesAvg
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











