import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List, Plus, Film, Tv } from "lucide-react";
import "./WatchlistPage.css";

const WatchlistPage = () => {
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5004/api/watchlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (json.success) {
        setWatchlists(json.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching watchlists:", err);
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return watchlists.reduce((sum, w) => sum + parseInt(w.item_count), 0);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <div className="header-left">
          <List size={32} />
          <div>
            <h1>My Watchlists</h1>
           
            <p className="watchlist-stats">
              {watchlists.length} watchlists • {getTotalItems()} total items
            </p>
          </div>
          
        </div>
         <button
              className="browse-movies-btn"
              onClick={() => navigate("/movies")}
            >back to home</button>
      </div>

      <div className="watchlists-grid">
        {watchlists.length > 0 ? (
          watchlists.map((watchlist) => (
            <div
              key={watchlist.watchlistid}
              className="watchlist-card"
              onClick={() => navigate(`/watchlist/${watchlist.watchlist_name}`)}
            >
              <div className="watchlist-icon-large">
                <List size={48} />
              </div>
              <div className="watchlist-stats-badge">
                {watchlist.item_count} items
              </div>
              <div className="watchlist-card-info">
                <h3>{watchlist.watchlist_name}</h3>
                <p className="watchlist-description">
                  {watchlist.completed_count} of {watchlist.item_count}{" "}
                  completed
                </p>
                <div className="watchlist-meta">
                  <span>
                    <Film size={16} />
                    {watchlist.item_count} items
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-watchlists">
            <List size={64} />
            <h3>No watchlists yet</h3>
            <p>
              Go to any movie or series page and click "Add to Watchlist" to
              create your first list!
            </p>
            <button
              className="browse-movies-btn"
              onClick={() => navigate("/movies")}
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
