import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  X,
  Film,
  Tv,
  Calendar,
  Star,
} from "lucide-react";
import "./WatchlistDetailsPage.css";

const WatchlistDetailsPage = () => {
  const { watchlistName } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, movies, series

  useEffect(() => {
    fetchWatchlistItems();
  }, [watchlistName]);

  const fetchWatchlistItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/watchlist/${encodeURIComponent(watchlistName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.success) {
        setItems(json.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching watchlist items:", err);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (watchlistId) => {
    if (!window.confirm("Remove this item from your watchlist?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/watchlist/item/${watchlistId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.success) {
        fetchWatchlistItems();
      } else {
        alert(json.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item");
    }
  };

  const handleToggleCompleted = async (watchlistId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/watchlist/toggle/${watchlistId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.success) {
        fetchWatchlistItems();
      } else {
        alert(json.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling completed:", error);
      alert("Error updating status");
    }
  };

  const handleItemClick = (item) => {
    if (item.type === "Movie") {
      navigate(`/movie/${item.mediaid}`);
    } else if (item.type === "Series") {
      navigate(`/series/${item.mediaid}`);
    }
  };

  const getFilteredItems = () => {
    if (filter === "all") return items;
    return items.filter((item) =>
      filter === "movies" ? item.type === "Movie" : item.type === "Series",
    );
  };

  const getStats = () => {
    const total = items.length;
    const completed = items.filter((i) => i.iscompleted).length;
    const movies = items.filter((i) => i.type === "Movie").length;
    const series = items.filter((i) => i.type === "Series").length;
    return { total, completed, movies, series };
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const stats = getStats();
  const filteredItems = getFilteredItems();

  return (
    <div className="watchlist-details-page">
      <button className="back-btn" onClick={() => navigate("/watchlist")}>
        <ArrowLeft size={20} />
        <span>Back to Watchlists</span>
      </button>

      <div className="watchlist-details-header">
        <div className="watchlist-icon-header">
          <Film size={64} />
          <div className="item-count-badge">{stats.total}</div>
        </div>
        <div className="watchlist-info">
          <p className="watchlist-label">WATCHLIST</p>
          <h1>{watchlistName}</h1>
          <div className="watchlist-stats-row">
            <span>{stats.total} items</span>
            <span className="stat-separator">•</span>
            <span>
              <Film size={16} />
              {stats.movies} movies
            </span>
            <span className="stat-separator">•</span>
            <span>
              <Tv size={16} />
              {stats.series} series
            </span>
            <span className="stat-separator">•</span>
            <span>
              {stats.completed} of {stats.total} watched
            </span>
          </div>
       
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "movies" ? "active" : ""}
            onClick={() => setFilter("movies")}
          >
            Movies
          </button>
          <button
            className={filter === "series" ? "active" : ""}
            onClick={() => setFilter("series")}
          >
            Series
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="watchlist-items-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.watchlistid}
              className={`watchlist-item-card ${item.iscompleted ? "completed" : ""}`}
            >
              <div
                className="item-poster"
                onClick={() => handleItemClick(item)}
                style={{ cursor: "pointer" }}
              >
                {item.poster ? (
                  <img src={item.poster} alt={item.title} />
                ) : (
                  <div className="poster-placeholder">
                    {item.type === "Movie" ? (
                      <Film size={48} />
                    ) : (
                      <Tv size={48} />
                    )}
                  </div>
                )}
                {item.iscompleted && (
                  <div className="completed-overlay">
                    <Check size={32} />
                  </div>
                )}
              </div>

              <div className="item-info">
                <h3
                  onClick={() => handleItemClick(item)}
                  style={{ cursor: "pointer" }}
                >
                  {item.title}
                </h3>
                <div className="item-meta">
                  <span className="item-type">
                    {item.type === "Movie" ? (
                      <Film size={14} />
                    ) : (
                      <Tv size={14} />
                    )}
                    {item.type}
                  </span>
                  <span>
                    <Calendar size={14} />
                    {item.releaseyear}
                  </span>
                  {item.rating && parseFloat(item.rating) > 0 && (
                    <span>
                      <Star size={14} fill="currentColor" />
                      {parseFloat(item.rating).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              <div className="item-actions">
                <button
                  className={`complete-btn ${item.iscompleted ? "completed" : ""}`}
                  onClick={() => handleToggleCompleted(item.watchlistid)}
                  title={
                    item.iscompleted ? "Mark as unwatched" : "Mark as watched"
                  }
                >
                  {item.iscompleted ? <X size={18} /> : <Check size={18} />}
                </button>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.watchlistid)}
                  title="Remove from watchlist"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-items">
            <Film size={64} />
            <h3>No {filter === "all" ? "" : filter} in this watchlist</h3>
            <p>Add items from movie or series detail pages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistDetailsPage;
