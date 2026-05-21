import { sql } from "../config/db.js";

// Get all watchlists for a user (for the main watchlist page)
export const getUserWatchlists = async (req, res) => {
  try {
    const username = req.user.username;

    // Get all unique watchlist titles with counts
    const watchlistsQuery = await sql`
      SELECT 
        title as watchlist_name,
        COUNT(*) as item_count,
        SUM(CASE WHEN iscompleted = true THEN 1 ELSE 0 END) as completed_count,
        MIN(watchlistid) as watchlistid
      FROM watchlist
      WHERE username = ${username}
      GROUP BY title
      ORDER BY MIN(watchlistid) DESC
    `;

    return res.status(200).json({
      success: true,
      data: watchlistsQuery
    });
  } catch (error) {
    console.error('Error fetching watchlists:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all items in a specific watchlist
export const getWatchlistItems = async (req, res) => {
  try {
    const username = req.user.username;
    const { watchlistName } = req.params;

    const itemsQuery = await sql`
      SELECT 
        w.watchlistid,
        w.mediaid,
        w.iscompleted,
        m.title,
        m.poster,
        m.rating,
        m.releaseyear,
        m.type,
        m.overview
      FROM watchlist w
      JOIN media m ON w.mediaid = m.mediaid
      WHERE w.username = ${username} AND w.title = ${watchlistName}
      ORDER BY w.watchlistid DESC
    `;

    return res.status(200).json({
      success: true,
      data: itemsQuery,
      watchlistName: watchlistName
    });
  } catch (error) {
    console.error('Error fetching watchlist items:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add item to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const username = req.user.username;
    const { mediaid, title } = req.body;

    if (!mediaid || !title) {
      return res.status(400).json({
        success: false,
        message: 'Media ID and watchlist title are required'
      });
    }

    // Check if already in this watchlist
    const existingItem = await sql`
      SELECT * FROM watchlist
      WHERE username = ${username} 
        AND mediaid = ${mediaid} 
        AND title = ${title}
    `;

    if (existingItem.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Item already in this watchlist'
      });
    }

    // Add to watchlist
    const newItem = await sql`
      INSERT INTO watchlist (username, mediaid, title, iscompleted)
      VALUES (${username}, ${mediaid}, ${title}, false)
      RETURNING *
    `;

    return res.status(201).json({
      success: true,
      message: 'Added to watchlist successfully',
      data: newItem[0]
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove item from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const username = req.user.username;
    const { watchlistId } = req.params;

    // Check if item exists and belongs to user
    const existingItem = await sql`
      SELECT * FROM watchlist
      WHERE watchlistid = ${watchlistId} AND username = ${username}
    `;

    if (existingItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Delete item
    await sql`
      DELETE FROM watchlist
      WHERE watchlistid = ${watchlistId} AND username = ${username}
    `;

    return res.status(200).json({
      success: true,
      message: 'Removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle completed status
export const toggleCompleted = async (req, res) => {
  try {
    const username = req.user.username;
    const { watchlistId } = req.params;

    // Check if item exists and belongs to user
    const existingItem = await sql`
      SELECT * FROM watchlist
      WHERE watchlistid = ${watchlistId} AND username = ${username}
    `;

    if (existingItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Toggle completed
    const updated = await sql`
      UPDATE watchlist
      SET iscompleted = NOT iscompleted
      WHERE watchlistid = ${watchlistId} AND username = ${username}
      RETURNING *
    `;

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error toggling completed:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new watchlist (creates first item with new title)
export const createWatchlist = async (req, res) => {
  try {
    const username = req.user.username;
    const { title, description, mediaid } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Watchlist title is required'
      });
    }

    // Check if watchlist name already exists for this user
    const existing = await sql`
      SELECT * FROM watchlist
      WHERE username = ${username} AND title = ${title}
    `;

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Watchlist with this name already exists'
      });
    }

    // If mediaid provided, add first item
    if (mediaid) {
      const newItem = await sql`
        INSERT INTO watchlist (username, mediaid, title, iscompleted)
        VALUES (${username}, ${mediaid}, ${title}, false)
        RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: 'Watchlist created successfully',
        data: newItem[0]
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Watchlist created (add items to populate)'
    });
  } catch (error) {
    console.error('Error creating watchlist:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete entire watchlist (all items with same title)
export const deleteWatchlist = async (req, res) => {
  try {
    const username = req.user.username;
    const { watchlistName } = req.params;

    const deleted = await sql`
      DELETE FROM watchlist
      WHERE username = ${username} AND title = ${watchlistName}
      RETURNING *
    `;

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Watchlist deleted successfully',
      deletedCount: deleted.length
    });
  } catch (error) {
    console.error('Error deleting watchlist:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};