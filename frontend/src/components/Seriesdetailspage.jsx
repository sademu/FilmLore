import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  MessageSquare,
  Edit2,
  Trash2,
} from "lucide-react";
import "./Seriesdetailspage.css";

const SeriesDetailsPage = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSeasons, setExpandedSeasons] = useState({});
  const [episodeReviews, setEpisodeReviews] = useState({});
  const [reviewingEpisode, setReviewingEpisode] = useState(null);
  const [episodeRating, setEpisodeRating] = useState(0);
  const [episodeReviewText, setEpisodeReviewText] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [userWatchlists, setUserWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState("");
  const [newWatchlistName, setNewWatchlistName] = useState("");

  // Helper function to render stars
  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        style={{
          opacity: i < Math.floor(rating) ? 1 : 0.3,
          fontSize: "0.9rem",
        }}
      >
        ⭐
      </span>
    ));
  };

  useEffect(() => {
    fetchSeriesDetails();
  }, [seriesId]);

  const fetchSeriesDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/series/${seriesId}`,
      );
      const json = await res.json();

      if (json.success) {
        setSeries(json.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching series:", err);
      setLoading(false);
    }
  };

  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons((prev) => {
      const newExpanded = {
        ...prev,
        [seasonNumber]: !prev[seasonNumber],
      };

      // If expanding, fetch reviews for all episodes in this season
      if (newExpanded[seasonNumber] && series.episodes) {
        const seasonEpisodes = series.episodes.filter(
          (ep) => (ep.seasonnumber || ep.seasonno) == seasonNumber,
        );
        seasonEpisodes.forEach((episode) => {
          if (!episodeReviews[episode.episodeid]) {
            fetchEpisodeReviews(episode.episodeid);
          }
        });
      }

      return newExpanded;
    });
  };

  const fetchEpisodeReviews = async (episodeId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/episode/${episodeId}/reviews`,
      );
      const json = await res.json();

      if (json.success) {
        setEpisodeReviews((prev) => ({
          ...prev,
          [episodeId]: json.data || [],
        }));
      }
    } catch (err) {
      console.error("Error fetching episode reviews:", err);
    }
  };

  const handleReviewEpisode = (episodeId) => {
    setReviewingEpisode(episodeId);
    setEpisodeRating(0);
    setEpisodeReviewText("");

    if (!episodeReviews[episodeId]) {
      fetchEpisodeReviews(episodeId);
    }
  };

  const handleSubmitEpisodeReview = async () => {
    if (!episodeRating || !episodeReviewText.trim()) {
      alert("Please provide both a rating and review text");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!token || !user) {
        alert("Please login to submit a review");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/episode/${reviewingEpisode}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: episodeRating,
            text: episodeReviewText,
          }),
        },
      );

      const json = await res.json();

      if (json.success) {
        alert("Episode review submitted successfully!");

        // Refresh episode reviews
        await fetchEpisodeReviews(reviewingEpisode);

        // Refresh series data to get updated ratings
        await fetchSeriesDetails();

        // Reset form
        setEpisodeRating(0);
        setEpisodeReviewText("");
        setReviewingEpisode(null);
      } else {
        alert(json.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting episode review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  const handleEditReview = (review, episodeId) => {
    setEditingReview({ ...review, episodeId });
    setEditRating(review.rating);
    setEditText(review.text);
  };

  const handleUpdateReview = async () => {
    if (!editRating || !editText.trim()) {
      alert("Please provide both a rating and review text");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/episode/review/${editingReview.reviewid}`,
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
        alert("Review updated successfully!");

        // Refresh episode reviews
        await fetchEpisodeReviews(editingReview.episodeId);

        // Refresh series data to get updated ratings
        await fetchSeriesDetails();

        // Reset edit state
        setEditingReview(null);
        setEditRating(0);
        setEditText("");
      } else {
        alert(json.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Error updating review. Please try again.");
    }
  };

  const handleDeleteReview = async (reviewId, episodeId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/episode/review/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.success) {
        alert("Review deleted successfully!");

        // Refresh episode reviews
        await fetchEpisodeReviews(episodeId);

        // Refresh series data to get updated ratings
        await fetchSeriesDetails();
      } else {
        alert(json.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review. Please try again.");
    }
  };

  const handleCancelReview = () => {
    setReviewingEpisode(null);
    setEpisodeRating(0);
    setEpisodeReviewText("");
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditText("");
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
        `${process.env.REACT_APP_API_URL}/api/watchlists`,
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
        `${process.env.REACT_APP_API_URL}/api/watchlist/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mediaid: seriesId, //
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

  if (!series) {
    return <div className="error">Series not found</div>;
  }

  // Group episodes by season
  const episodesBySeason = {};
  if (series.episodes && series.episodes.length > 0) {
    series.episodes.forEach((episode) => {
      let seasonNum =
        episode.seasonnumber ||
        episode.seasonno ||
        episode.season_number ||
        episode.seasonid;

      if (!seasonNum && series.seasons && episode.seasonid) {
        const season = series.seasons.find(
          (s) => s.seasonid === episode.seasonid,
        );
        seasonNum = season ? season.seasonnumber || season.seasonno : null;
      }

      if (!seasonNum) {
        seasonNum = "Unknown";
      }

      if (!episodesBySeason[seasonNum]) {
        episodesBySeason[seasonNum] = [];
      }
      episodesBySeason[seasonNum].push(episode);
    });
  }

  return (
    <div className="series-details-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/series")}>
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      {/* Hero Section */}
      <div className="hero-section">
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${series.poster})` }}
        >
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <div className="series-poster-large">
            {series.poster ? (
              <img src={series.poster} alt={series.title} />
            ) : (
              <div className="poster-placeholder">
                <Star size={64} />
              </div>
            )}
          </div>

          <div className="series-info-hero">
            <h1 className="series-title">{series.title}</h1>
            <p className="series-tagline">"{series.overview}"</p>

            <div className="series-meta">
              <span className="rating">
                <Star size={20} fill="currentColor" />
                {series.rating}/10
              </span>
              <span className="year-range">
                📅 {series.startyear || series.releaseyear} -{" "}
                {series.isongoing ? "Present" : series.endyear || "Ended"}
              </span>
              <span className="seasons">
                📺 {series.seasons?.length || series.total_seasons || "N/A"}{" "}
                Seasons
              </span>
              <span className="language">🌐 {series.language}</span>
            </div>

            <div className="genre-tags">
              {series.genres &&
                series.genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {genre.genrename}
                  </span>
                ))}
            </div>

            <div className="action-buttons">
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

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "episodes" ? "active" : ""}`}
          onClick={() => setActiveTab("episodes")}
        >
          Episodes
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
      </div>

      {/* Content Sections */}
      <div className="content-container">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="section-card">
              <h2>📖 Plot Summary</h2>
              <p>{series.overview || "No plot summary available."}</p>
            </div>

            <div className="section-card">
              <h2>📺 Series Details</h2>
              <div className="production-grid">
                <div className="detail-item">
                  <span className="label">Creator</span>
                  <span className="value">
                    {series.directors && series.directors.length > 0
                      ? series.directors.map((d) => d.directorname).join(", ")
                      : "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Network/Studio</span>
                  <span className="value">
                    {series.studios && series.studios.length > 0
                      ? series.studios.map((s) => s.studioname).join(", ")
                      : "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Country</span>
                  <span className="value">{series.country || "Unknown"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Episodes</span>
                  <span className="value">
                    {series.episodes?.length || series.total_episodes || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "episodes" && (
          <div className="episodes-section">
            <h2 className="section-title">Episodes</h2>

            {Object.keys(episodesBySeason).length > 0 ? (
              Object.keys(episodesBySeason)
                .sort((a, b) => a - b)
                .map((seasonNum) => {
                  const seasonEpisodes = episodesBySeason[seasonNum];

                  return (
                    <div key={seasonNum} className="season-container">
                      <button
                        className="season-header"
                        onClick={() => toggleSeason(seasonNum)}
                      >
                        <h3>Season {seasonNum}</h3>
                        <div className="season-info">
                          {(() => {
                            const season = series.seasons?.find(
                              (s) =>
                                String(s.seasonnumber || s.seasonno) ===
                                String(seasonNum),
                            );
                            if (
                              season &&
                              season.avgrating &&
                              parseFloat(season.avgrating) > 0
                            ) {
                              return (
                                <span className="season-rating">
                                  <Star size={16} fill="currentColor" />
                                  {parseFloat(season.avgrating).toFixed(1)}/10
                                </span>
                              );
                            }
                            return null;
                          })()}
                          <span className="episode-count">
                            {seasonEpisodes.length} Episodes
                          </span>
                        </div>
                        {expandedSeasons[seasonNum] ? (
                          <ChevronUp size={24} />
                        ) : (
                          <ChevronDown size={24} />
                        )}
                      </button>

                      {expandedSeasons[seasonNum] && (
                        <div className="episodes-list">
                          {seasonEpisodes.map((episode) => {
                            const currentUser = JSON.parse(
                              localStorage.getItem("user"),
                            );
                            const reviews =
                              episodeReviews[episode.episodeid] || [];

                            return (
                              <div
                                key={episode.episodeid}
                                className="episode-card"
                              >
                                <div className="episode-main">
                                  <div className="episode-number">
                                    E
                                    {episode.episodenumber || episode.episodeno}
                                  </div>
                                  <div className="episode-info">
                                    <h4>
                                      {episode.title || episode.episodetitle}
                                    </h4>
                                    <div className="episode-meta">
                                      <span>
                                        <Clock size={16} />
                                        {episode.duration || "N/A"} min
                                      </span>
                                      {episode.avgrating &&
                                        parseFloat(episode.avgrating) > 0 && (
                                          <span>
                                            <Star
                                              size={16}
                                              fill="currentColor"
                                            />
                                            {parseFloat(
                                              episode.avgrating,
                                            ).toFixed(1)}
                                            /10
                                          </span>
                                        )}
                                    </div>
                                    <p className="episode-synopsis">
                                      {episode.synopsis ||
                                        episode.overview ||
                                        "No synopsis available."}
                                    </p>
                                    <div className="episode-actions">
                                      <button
                                        className="review-btn"
                                        onClick={() =>
                                          handleReviewEpisode(episode.episodeid)
                                        }
                                      >
                                        <MessageSquare size={16} />
                                        Review ({reviews.length})
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Review Form */}
                                {reviewingEpisode === episode.episodeid && (
                                  <div className="episode-review-form">
                                    <h5>Write a Review for this Episode</h5>
                                    <div className="rating-input">
                                      <label>Your Rating</label>
                                      <div className="star-rating">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                          (star) => (
                                            <button
                                              key={star}
                                              className={`star ${episodeRating >= star ? "active" : ""}`}
                                              onClick={() =>
                                                setEpisodeRating(star)
                                              }
                                            >
                                              ⭐
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                    <textarea
                                      placeholder="Share your thoughts about this episode..."
                                      value={episodeReviewText}
                                      onChange={(e) =>
                                        setEpisodeReviewText(e.target.value)
                                      }
                                      rows={4}
                                    />
                                    <div className="review-form-actions">
                                      <button
                                        className="submit-episode-review-btn"
                                        onClick={handleSubmitEpisodeReview}
                                      >
                                        Submit Review
                                      </button>
                                      <button
                                        className="cancel-review-btn"
                                        onClick={handleCancelReview}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Reviews List */}
                                {reviews.length > 0 && (
                                  <div className="episode-reviews">
                                    <h5>Reviews ({reviews.length})</h5>
                                    {reviews.map((review) => {
                                      const isMyReview =
                                        currentUser &&
                                        review.username ===
                                          currentUser.username;
                                      const isEditing =
                                        editingReview?.reviewid ===
                                        review.reviewid;

                                      return (
                                        <div
                                          key={review.reviewid}
                                          className="mini-review"
                                        >
                                          <div className="mini-review-header">
                                            <strong>{review.username}</strong>
                                            {!isEditing && (
                                              <span className="mini-rating">
                                                {renderStars(review.rating)}{" "}
                                                {review.rating}/10
                                              </span>
                                            )}
                                            <span className="mini-review-date">
                                              {new Date(
                                                review.date,
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>

                                          {isEditing ? (
                                            <div className="edit-review-section">
                                              <div className="rating-input">
                                                <label>Your Rating</label>
                                                <div className="star-rating">
                                                  {[
                                                    1, 2, 3, 4, 5, 6, 7, 8, 9,
                                                    10,
                                                  ].map((star) => (
                                                    <button
                                                      key={star}
                                                      className={`star ${editRating >= star ? "active" : ""}`}
                                                      onClick={() =>
                                                        setEditRating(star)
                                                      }
                                                    >
                                                      ⭐
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                              <textarea
                                                value={editText}
                                                onChange={(e) =>
                                                  setEditText(e.target.value)
                                                }
                                                rows={3}
                                              />
                                              <div className="review-form-actions">
                                                <button
                                                  className="submit-episode-review-btn"
                                                  onClick={handleUpdateReview}
                                                >
                                                  Save
                                                </button>
                                                <button
                                                  className="cancel-review-btn"
                                                  onClick={handleCancelEdit}
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <p>{review.text}</p>
                                              {isMyReview && (
                                                <div className="review-actions-mini">
                                                  <button
                                                    className="edit-btn-mini"
                                                    onClick={() =>
                                                      handleEditReview(
                                                        review,
                                                        episode.episodeid,
                                                      )
                                                    }
                                                  >
                                                    <Edit2 size={14} />
                                                    Edit
                                                  </button>
                                                  <button
                                                    className="delete-btn-mini"
                                                    onClick={() =>
                                                      handleDeleteReview(
                                                        review.reviewid,
                                                        episode.episodeid,
                                                      )
                                                    }
                                                  >
                                                    <Trash2 size={14} />
                                                    Delete
                                                  </button>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="no-data">No episodes information available.</p>
            )}
          </div>
        )}

        {activeTab === "cast" && (
          <div className="cast-section">
            <div className="section-card">
              <h2>🎭 Cast</h2>
              <div className="cast-grid">
                {series.actors && series.actors.length > 0 ? (
                  series.actors.map((actor) => (
                    <div key={actor.actorid} className="cast-card">
                      <div className="actor-photo">
                        {actor.actorphoto || actor.picture ? (
                          <img
                            src={actor.actorphoto || actor.picture}
                            alt={actor.actorname}
                          />
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
                {series.awards && series.awards.length > 0 ? (
                  series.awards.map((award, idx) => (
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
      </div>

      {/* Watchlist Modal - MOVED OUTSIDE all tabs */}
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

export default SeriesDetailsPage;
