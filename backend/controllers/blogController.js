import { sql } from "../config/db.js";

// Get all blog posts (for feed) — UNCHANGED
export const getAllBlogs = async (req, res) => {
  try {
    const blogsQuery = await sql`
      SELECT 
        b.blogid,
        b.username,
        b.title,
        b.content,
        b.createdate,
        b.updatedate,
        COUNT(DISTINCT c.commentid) as comment_count,
        COUNT(DISTINCT r.reactionid) as reaction_count
      FROM blog b
      LEFT JOIN blogcomment c ON b.blogid = c.blogid
      LEFT JOIN blogreaction r ON b.blogid = r.blogid
      GROUP BY b.blogid, b.username, b.title, b.content, b.createdate, b.updatedate
      ORDER BY b.createdate DESC
    `;

    return res.status(200).json({
      success: true,
      data: blogsQuery
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// USES FUNCTION: get_blog_with_details()
export const getBlogById = async (req, res) => {
  try {
    const blogId = Number(req.params.blogId);

    const result = await sql`
      SELECT * FROM get_blog_with_details(${blogId})
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//  USES PROCEDURE: create_blog()
export const createBlog = async (req, res) => {
  try {
    const username = req.user.username;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Call the procedure
    await sql`CALL create_blog(${username}, ${title}, ${content})`;

    // Fetch the newly created blog to return it
    const newBlog = await sql`
      SELECT * FROM blog
      WHERE username = ${username}
      ORDER BY createdate DESC
      LIMIT 1
    `;

    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlog[0]
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// TRIGGER handles updatedate automatically — removed manual SET updatedate
export const updateBlog = async (req, res) => {
  try {
    const blogId = Number(req.params.blogId);
    const username = req.user.username;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const existingBlog = await sql`
      SELECT * FROM blog
      WHERE blogid = ${blogId} AND username = ${username}
    `;

    if (existingBlog.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found or you are not authorized to edit it'
      });
    }

    // No need to SET updatedate — trigger fires automatically
    const updatedBlog = await sql`
      UPDATE blog
      SET title = ${title}, content = ${content}
      WHERE blogid = ${blogId} AND username = ${username}
      RETURNING *
    `;

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog[0]
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Delete blog post — UNCHANGED
export const deleteBlog = async (req, res) => {
  try {
    const blogId = Number(req.params.blogId);
    const username = req.user.username;

    const existingBlog = await sql`
      SELECT * FROM blog
      WHERE blogid = ${blogId} AND username = ${username}
    `;

    if (existingBlog.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found or you are not authorized to delete it'
      });
    }

    await sql`
      DELETE FROM blog
      WHERE blogid = ${blogId} AND username = ${username}
    `;

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Add comment — UNCHANGED
export const addComment = async (req, res) => {
  try {
    const blogId = Number(req.params.blogId);
    const username = req.user.username;
    const { commenttext } = req.body;

    if (!commenttext || !commenttext.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const newComment = await sql`
      INSERT INTO blogcomment (blogid, username, commenttext)
      VALUES (${blogId}, ${username}, ${commenttext})
      RETURNING *
    `;

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment[0]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Delete comment — UNCHANGED
export const deleteComment = async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);
    const username = req.user.username;

    const existingComment = await sql`
      SELECT * FROM blogcomment
      WHERE commentid = ${commentId} AND username = ${username}
    `;

    if (existingComment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or you are not authorized to delete it'
      });
    }

    await sql`
      DELETE FROM blogcomment
      WHERE commentid = ${commentId} AND username = ${username}
    `;

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Toggle reaction — UNCHANGED
export const toggleReaction = async (req, res) => {
  try {
    const blogId = Number(req.params.blogId);
    const username = req.user.username;
    const { reactiontype } = req.body;

    const existingReaction = await sql`
      SELECT * FROM blogreaction
      WHERE blogid = ${blogId} AND username = ${username}
    `;

    if (existingReaction.length > 0) {
      await sql`
        DELETE FROM blogreaction
        WHERE blogid = ${blogId} AND username = ${username}
      `;
      return res.status(200).json({ success: true, message: 'Reaction removed', action: 'removed' });
    } else {
      const newReaction = await sql`
        INSERT INTO blogreaction (blogid, username, reactiontype)
        VALUES (${blogId}, ${username}, ${reactiontype || 'like'})
        RETURNING *
      `;
      return res.status(201).json({ success: true, message: 'Reaction added', action: 'added', data: newReaction[0] });
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Check user reaction — UNCHANGED
export const checkUserReaction = async (req, res) => {
  try {
    const blogId = Number(req.params.blogId);
    const username = req.user.username;

    const reaction = await sql`
      SELECT * FROM blogreaction
      WHERE blogid = ${blogId} AND username = ${username}
    `;

    return res.status(200).json({
      success: true,
      hasReacted: reaction.length > 0,
      reaction: reaction.length > 0 ? reaction[0] : null
    });
  } catch (error) {
    console.error('Error checking reaction:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};