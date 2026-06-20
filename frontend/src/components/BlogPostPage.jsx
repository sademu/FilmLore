import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Calendar,
  User,
  Edit2,
  Trash2,
  Send,
  Import,
} from "lucide-react";
import "./BlogPage.css";

const BlogPostPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlogPost();
    checkUserReaction();
  }, [blogId]);

  const fetchBlogPost = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blog/${blogId}`,
      );
      const json = await res.json();

      if (json.success) {
        setBlog(json.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching blog post:", err);
      setLoading(false);
    }
  };

  const checkUserReaction = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blog/${blogId}/reaction/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();

      if (json.success) {
        setHasLiked(json.hasReacted);
      }
    } catch (err) {
      console.error("Error checking reaction:", err);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to like posts");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blog/${blogId}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reactiontype: "like" }),
        },
      );

      const json = await res.json();

      if (json.success) {
        setHasLiked(json.action === "added");
        fetchBlogPost(); // Refresh to update count
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("Please write a comment");
      return;
    }

    setSubmittingComment(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to comment");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blog/${blogId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commenttext: commentText }),
        },
      );

      const json = await res.json();

      if (json.success) {
        setCommentText("");
        fetchBlogPost(); // Refresh to show new comment
      } else {
        alert(json.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Error adding comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/blog/comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.success) {
        fetchBlogPost();
      } else {
        alert(json.message || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Error deleting comment");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this blog post? This cannot be undone."))
      return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/blog/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (json.success) {
        alert("Blog post deleted");
        navigate("/blog");
      } else {
        alert(json.message || "Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Error deleting post");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (!blog) {
    return <div className="error">Blog post not found</div>;
  }

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAuthor = currentUser && currentUser.username === blog.username;

  return (
    <div className="blog-post-page">
      <button className="back-btn" onClick={() => navigate("/blog")}>
        <ArrowLeft size={20} />
        Back to Blog
      </button>

      <article className="blog-post">
        <header className="post-header">
          <h1>{blog.title}</h1>

          <div className="post-meta">
            <div className="author-section">
              <div className="author-avatar">
                <User size={24} />
              </div>
              <div>
                <div className="author-name">{blog.username}</div>
                <div className="post-date">
                  <Calendar size={14} />
                  {formatDate(blog.createdate)}
                  {blog.updatedate !== blog.createdate && " (edited)"}
                </div>
              </div>
            </div>

            {isAuthor && (
              <div className="post-actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/blog/edit/${blogId}`)}
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button className="delete-btn" onClick={handleDeletePost}>
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="post-content">
          <p>{blog.content}</p>
        </div>

        <div className="post-footer">
          <button
            className={`like-btn ${hasLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
            {blog.reaction_count} {blog.reaction_count === 1 ? "Like" : "Likes"}
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <section className="comments-section">
        <h2>
          <MessageCircle size={24} />
          Comments ({blog.comments?.length || 0})
        </h2>

        <div className="add-comment">
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <button
            className="submit-comment-btn"
            onClick={handleAddComment}
            disabled={submittingComment}
          >
            <Send size={18} />
            {submittingComment ? "Posting..." : "Post Comment"}
          </button>
        </div>

        <div className="comments-list">
          {blog.comments && blog.comments.length > 0 ? (
            blog.comments.map((comment) => {
              const isMyComment =
                currentUser && currentUser.username === comment.username;

              return (
                <div key={comment.commentid} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="author-avatar-small">
                        <User size={16} />
                      </div>
                      <span className="comment-username">
                        {comment.username}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.commentdate)}
                      </span>
                    </div>

                    {isMyComment && (
                      <button
                        className="delete-comment-btn"
                        onClick={() => handleDeleteComment(comment.commentid)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{comment.commenttext}</p>
                </div>
              );
            })
          ) : (
            <p className="no-comments">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPostPage;
