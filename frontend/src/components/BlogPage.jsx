import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PenSquare, Heart, MessageCircle, Calendar, User } from "lucide-react";
import "./BlogPage.css";


const BlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/blogs`);
      const json = await res.json();

      if (json.success) {
        setBlogs(json.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setLoading(false);
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading blogs...</div>;
  }

  return (
    <div className="blog-page">
      {/* Header */}
      <div className="blog-header">
        <div className="header-content">
          <h1>FILMLORE Blog</h1>
          <p>Thoughts, reviews, and insights from our community</p>
        </div>
        <div className="header-buttons">
          <button
            className="browse-movies-btn"
            onClick={() => navigate("/movies")}
          >
            back to home
          </button>
          <button
            className="write-post-btn"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                alert("Please login to write a post");
                navigate("/login");
              } else {
                navigate("/blog/create");
              }
            }}
          >
            <PenSquare size={20} />
            Write Post
          </button>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="blogs-grid">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div
              key={blog.blogid}
              className="blog-card"
              onClick={() => navigate(`/blog/${blog.blogid}`)}
            >
              <div className="blog-card-header">
                <div className="author-info">
                  <div className="author-avatar">
                    <User size={20} />
                  </div>
                  <div className="author-details">
                    <span className="author-name">{blog.username}</span>
                    <span className="post-date">
                      <Calendar size={14} />
                      {formatDate(blog.createdate)}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="blog-title">{blog.title}</h2>
              <p className="blog-excerpt">{truncateContent(blog.content)}</p>

              <div className="blog-card-footer">
                <div className="blog-stats">
                  <span className="stat">
                    <Heart size={16} />
                    {blog.reaction_count}
                  </span>
                  <span className="stat">
                    <MessageCircle size={16} />
                    {blog.comment_count}
                  </span>
                </div>
                <span className="read-more">Read more →</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-blogs">
            <PenSquare size={64} />
            <h3>No blog posts yet</h3>
            <p>Be the first to share your thoughts!</p>
            <button
              className="write-post-btn"
              onClick={() => navigate("/blog/create")}
            >
              <PenSquare size={20} />
              Write First Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
