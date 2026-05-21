import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import "./BlogPage.css";

const CreateBlogPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to create a blog post");
      navigate("/login");
      return;
    }

    // If blogId exists, we're in edit mode
    if (blogId) {
      setIsEditMode(true);
      fetchBlogPost();
    }
  }, [blogId]);

  const fetchBlogPost = async () => {
    try {
      const res = await fetch(`http://localhost:5004/api/blog/${blogId}`);
      const json = await res.json();

      if (json.success) {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        // Check if current user is the author
        if (json.data.username !== currentUser.username) {
          alert("You can only edit your own posts");
          navigate("/blog");
          return;
        }

        setTitle(json.data.title);
        setContent(json.data.content);
      }
    } catch (err) {
      console.error("Error fetching blog post:", err);
      alert("Error loading blog post");
      navigate("/blog");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditMode
        ? `http://localhost:5004/api/blog/${blogId}`
        : "http://localhost:5004/api/blog";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const json = await res.json();

      if (json.success) {
        alert(
          isEditMode
            ? "Blog post updated successfully!"
            : "Blog post created successfully!",
        );
        navigate(isEditMode ? `/blog/${blogId}` : `/blog/${json.data.blogid}`);
      } else {
        alert(json.message || "Failed to save blog post");
      }
    } catch (err) {
      console.error("Error saving blog post:", err);
      alert("Error saving blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog-page">
      <button className="back-btn" onClick={() => navigate("/blog")}>
        <ArrowLeft size={20} />
        Back to Blog
      </button>

      <div className="create-blog-container">
        <h1>{isEditMode ? "Edit Blog Post" : "Write New Post"}</h1>

        <form onSubmit={handleSubmit} className="blog-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter an engaging title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
            />
            <span className="char-count">{title.length}/255</span>
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              placeholder="Share your thoughts, reviews, or insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/blog")}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              <Save size={20} />
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Post"
                  : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogPage;
