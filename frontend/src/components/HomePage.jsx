import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Home, Film, TrendingUp, Star, Play, List } from "lucide-react";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);

  // Fetch featured movies
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const res = await fetch("http://localhost:5004/api/movies");
        const json = await res.json();

        if (json.success) {
          setFeaturedMovies(
            json.data.slice(0, 3).map((m) => ({
              id: m.mediaid,
              title: m.title,
              description: m.overview,
              rating: m.rating,
              image: m.poster,
              year: m.releaseyear,
              trailer: m.trailer,
            })),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // Fetch top rated movies
  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        const res = await fetch("http://localhost:5004/api/moviesTopRated");
        const json = await res.json();
        if (json.success) {
          setTopRatedMovies(
            json.data.map((m) => ({
              id: m.mediaid,
              title: m.title,
              year: m.releaseyear,
              genre: m.language,
              rating: m.rating,
              image: m.poster,
            })),
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopRatedMovies();
  }, []);

  // Auto-rotate featured movie
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const currentFeatured = featuredMovies[currentFeaturedIndex];

  if (!currentFeatured) {
    return null;
  }

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-left">
          <h1
            className="logo"
            onClick={() => navigate("/home")}
            style={{ cursor: "pointer" }}
          >
            FILMLORE
          </h1>
          <div className="nav-links">
            <button
              onClick={() => navigate("/home")}
              className="nav-link active"
              style={{ border: "none", background: "transparent" }}
            >
              <Home size={20} />
              <span>Movies</span>
            </button>
          </div>
        </div>

        <div className="nav-right">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search movies, shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="user-icon">
            <div className="avatar">U</div>
          </button>
        </div>
      </nav>

      {/* Featured Section */}
      <section className="featured-section">
        <div
          className="featured-background"
          style={{ backgroundImage: `url(${currentFeatured.image})` }}
        >
          <div className="featured-overlay" />
        </div>
        <div className="featured-content">
          <h2 className="featured-label">Featured: {currentFeatured.title}</h2>
          <p className="featured-description">{currentFeatured.description}</p>
          <div className="featured-info">
            <div className="rating">
              <Star size={20} fill="currentColor" />
              <span>{currentFeatured.rating}/10</span>
            </div>
            <button
              className="watch-trailer-btn"
              onClick={() => window.open(currentFeatured.trailer, "_blank")}
            >
              <Play size={18} />
              Watch Trailer
            </button>
          </div>
        </div>
      </section>

      {/* Top Rated Movies */}
      <section className="movies-section">
        <h2 className="section-title">
          <Star size={24} />
          Top Rated Movies
        </h2>
        <div className="top-rated-grid">
          {topRatedMovies.map((movie) => (
            <div
              key={movie.id}
              className="top-rated-card"
              onClick={() => navigate(`/movie/${movie.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="top-rated-poster">
                {movie.image ? (
                  <img
                    src={movie.image}
                    alt={movie.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Film size={40} />
                )}
              </div>
              <div className="top-rated-info">
                <h3>{movie.title}</h3>
                <p className="movie-year">{movie.year}</p>
                <p className="movie-genre">{movie.genre}</p>
                <div className="movie-rating">
                  <Star size={14} fill="currentColor" />
                  <span>{movie.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
