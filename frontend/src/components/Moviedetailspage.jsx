import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Bookmark, Share2, Star, Award } from "lucide-react";
import "./Moviedetailspage.css";

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [userWatchlists, setUserWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState("");
  const [newWatchlistName, setNewWatchlistName] = useState("");

  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        style={{
          opacity: i < Math.floor(rating) ? 1 : 0.3,
          fontSize: "1rem",
        }}
      >
        ⭐
      </span>
    ));
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/movies/${movieId}`,
        );
        const json = await res.json();
        console.log("Movie details response:", json);
        if (json.success) {
          setMovie(json.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching movie:", err);
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/movies/${movieId}/reviews`,
        );
        const json = await res.json();

        if (json.success) {
          setReviews(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      }
    };

    fetchMovieDetails();
    fetchReviews();
  }, [movieId]);

  const handleSubmitReview = async () => {
    if (!userRating || !reviewText.trim()) {
      alert("Please provide both a rating and review text");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/movies/${movieId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rating: userRating,
            text: reviewText,
            movieId: movieId,
            username: user?.username || "Anonymous",
          }),
        },
      );

      const json = await res.json();

      if (json.success) {
        const newReview = {
          username: user?.username || "Anonymous",
          rating: userRating,
          text: reviewText,
          date: new Date().toISOString().split("T")[0],
        };

        setReviews((prevReviews) => [newReview, ...prevReviews]);
        setUserRating(0);
        setReviewText("");

        alert("Review submitted successfully!");
      } else {
        alert(json.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.reviewid);
    setEditRating(review.rating);
    setEditText(review.text);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditText("");
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editRating || !editText.trim()) {
      alert("Please provide both a rating and review text");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: editRating,
            text: editText,
          }),
        },
      );

      const json = await res.json();

      if (json.success) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.reviewid === reviewId
              ? { ...review, rating: editRating, text: editText }
              : review,
          ),
        );

        if (json.data.newMovieRating) {
          setMovie((prevMovie) => ({
            ...prevMovie,
            rating: json.data.newMovieRating,
          }));
        }

        handleCancelEdit();
        alert("Review updated successfully!");
      } else {
        alert(json.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Error updating review. Please try again.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.success) {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.reviewid !== reviewId),
        );

        if (json.data.newMovieRating) {
          setMovie((prevMovie) => ({
            ...prevMovie,
            rating: json.data.newMovieRating,
          }));
        }

        alert("Review deleted successfully!");
      } else {
        alert(json.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review. Please try again.");
    }
  };

  const fetchUserWatchlists = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to add to watchlist");
        navigate("/login");
        return;
      }

      const res = await fetch(
        "${process.env.REACT_APP_API_URL}/api/watchlists",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (json.success) {
        setUserWatchlists(json.data);
      }
    } catch (err) {
      console.error("Error fetching watchlists:", err);
    }
  };

  const handleAddToWatchlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add to watchlist");
      navigate("/login");
      return;
    }

    const watchlistTitle =
      selectedWatchlist === "new" ? newWatchlistName : selectedWatchlist;

    if (!watchlistTitle) {
      alert("Please select or create a watchlist");
      return;
    }

    try {
      const res = await fetch(
        "${process.env.REACT_APP_API_URL}/api/watchlist/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mediaid: movieId,
            title: watchlistTitle,
          }),
        },
      );

      const json = await res.json();

      if (json.success) {
        alert("Added to watchlist!");
        setShowWatchlistModal(false);
        setSelectedWatchlist("");
        setNewWatchlistName("");
      } else {
        alert(json.message || "Failed to add to watchlist");
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      alert("Error adding to watchlist");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found</div>;
  }

  return (
    <div className="movie-details-page">
      <button className="back-btn" onClick={() => navigate("/movies/")}>
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="hero-section">
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${movie.poster})` }}
        >
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <div className="movie-poster-large">
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} />
            ) : (
              <div className="poster-placeholder">
                <Play size={64} />
              </div>
            )}
          </div>

          <div className="movie-info-hero">
            <h1 className="movie-title">{movie.title}</h1>
            <p className="movie-tagline">{movie.overview}</p>

            <div className="movie-meta">
              <span className="rating">
                <Star size={20} fill="currentColor" />
                {movie.rating}/10
              </span>
              <span className="year">📅 {movie.releaseyear || movie.year}</span>
              <span className="duration">⏱️ {movie.duration || "148 min"}</span>
              <span className="language">🌐 {movie.language}</span>
            </div>

            <div className="genre-tags">
              {movie.genres &&
                movie.genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {genre.genrename}
                  </span>
                ))}
            </div>

            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={() => window.open(movie.trailer, "_blank")}
              >
                <Play size={20} />
                Watch Trailer
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  fetchUserWatchlists();
                  setShowWatchlistModal(true);
                }}
              >
                <Bookmark size={20} />
                Add to Watchlist
              </button>
              <button className="btn-icon">
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "cast" ? "active" : ""}`}
          onClick={() => setActiveTab("cast")}
        >
          Cast & Crew
        </button>
        <button
          className={`tab ${activeTab === "awards" ? "active" : ""}`}
          onClick={() => setActiveTab("awards")}
        >
          Awards
        </button>
        <button
          className={`tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      <div className="content-container">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="section-card">
              <h2>📖 Plot Summary</h2>
              <p>{movie.overview || "No plot summary available."}</p>
            </div>

            <div className="section-card">
              <h2>🎬 Production Details</h2>
              <div className="production-grid">
                <div className="detail-item">
                  <span className="label">Director</span>
                  <span className="value">
                    {movie.directors && movie.directors.length > 0
                      ? movie.directors.map((d) => d.directorname).join(", ")
                      : "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Studio</span>
                  <span className="value">
                    {movie.studios && movie.studios.length > 0
                      ? movie.studios.map((s) => s.studioname).join(", ")
                      : "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Country</span>
                  <span className="value">{movie.country || "Unknown"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Release Year</span>
                  <span className="value">
                    {movie.releaseyear || movie.year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cast" && (
          <div className="cast-section">
            <div className="section-card">
              <h2>🎭 Cast</h2>
              <div className="cast-grid">
                {movie.actors && movie.actors.length > 0 ? (
                  movie.actors.map((actor) => (
                    <div key={actor.actorid} className="cast-card">
                      <div className="actor-photo">
                        {actor.actorphoto ? (
                          <img src={actor.actorphoto} alt={actor.actorname} />
                        ) : (
                          <div className="photo-placeholder">👤</div>
                        )}
                      </div>
                      <div className="actor-info">
                        <h3>{actor.actorname}</h3>
                        <p>{actor.charactername || "Role"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No cast information available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "awards" && (
          <div className="awards-section">
            <div className="section-card">
              <h2>
                <Award size={24} />
                Awards & Nominations
              </h2>
              <div className="awards-list">
                {movie.awards && movie.awards.length > 0 ? (
                  movie.awards.map((award, idx) => (
                    <div key={idx} className="award-item">
                      <div className="award-icon">
                        <Award size={24} />
                      </div>
                      <div className="award-details">
                        <h3>{award.awardname}</h3>
                        <p>{award.awardcategory}</p>
                        <span className="award-year">{award.awardyear}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No awards information available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            <div className="section-card">
              <h2>💬 Write a Review</h2>
              <div className="review-form">
                <div className="rating-input">
                  <label>Your Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        className={`star ${userRating >= star ? "active" : ""}`}
                        onClick={() => setUserRating(star)}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Share your thoughts about this movie..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                />
                <button
                  className="submit-review-btn"
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </button>
              </div>
            </div>

            <div className="section-card">
              <h2>👥 User Reviews ({reviews.length})</h2>
              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((review, idx) => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    const isMyReview =
                      user && review.username === user.username;
                    const isEditing = editingReviewId === review.reviewid;

                    return (
                      <div key={idx} className="review-item">
                        <div className="review-header">
                          <h3>{review.username || "Anonymous User"}</h3>
                          <div className="review-rating">
                            {isEditing ? (
                              <div className="edit-star-rating">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                  <button
                                    key={star}
                                    className={`star ${editRating >= star ? "active" : ""}`}
                                    onClick={() => setEditRating(star)}
                                  >
                                    ⭐
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <>
                                {renderStars(review.rating)} {review.rating}/10
                              </>
                            )}
                          </div>
                          <span className="review-date">
                            {review.date ||
                              new Date().toISOString().split("T")[0]}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="edit-review-form">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={5}
                              className="edit-textarea"
                            />
                            <div className="edit-actions">
                              <button
                                className="save-edit-btn"
                                onClick={() =>
                                  handleUpdateReview(review.reviewid)
                                }
                              >
                                Save
                              </button>
                              <button
                                className="cancel-edit-btn"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="review-text">{review.text}</p>
                        )}

                        {isMyReview && !isEditing && (
                          <div className="review-actions">
                            <button
                              className="edit-review-btn"
                              onClick={() => handleEditReview(review)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-review-btn"
                              onClick={() =>
                                handleDeleteReview(review.reviewid)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-data">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Watchlist Modal */}
      {showWatchlistModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowWatchlistModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add to Watchlist</h2>

            <select
              value={selectedWatchlist}
              onChange={(e) => setSelectedWatchlist(e.target.value)}
            >
              <option value="">Select a watchlist...</option>
              {userWatchlists.map((wl) => (
                <option key={wl.watchlistid} value={wl.watchlist_name}>
                  {wl.watchlist_name} ({wl.item_count} items)
                </option>
              ))}
              <option value="new">+ Create New Watchlist</option>
            </select>

            {selectedWatchlist === "new" && (
              <input
                type="text"
                placeholder="New watchlist name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
              />
            )}

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleAddToWatchlist}>
                Add
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowWatchlistModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailsPage;
