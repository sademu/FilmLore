import React, { useState, useEffect } from "react";
import {
  Search,
  Film,
  Tv,
  BookOpen,
  Heart,
  Bookmark,
  LayoutDashboard,
  User,
  LogOut,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MoviesPage.css";

const MoviesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [user, setUser] = useState(null);

  const [filters, setFilters] = useState({
    country: "All Countries",
    language: "All Languages",
    genre: "All Genres",
  });

  const countries = [
    "All Countries",
    "America",
    "Canada",
    "Korea",
    "Japan",
    "France",
    "UK",
  ];
  const languages = [
    "All Languages",
    "English",
    "Korean",
    "Japanese",
    "French",
    "Spanish",
  ];
  const genres = [
    "All Genres",
    "Action",
    "Drama",
    "Comedy",
    "Thriller",
    "Sci-Fi",
    "Horror",
    "Romance",
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5004/api/movies");
        const json = await res.json();
        if (json.success) {
          const moviesData = json.data.map((m) => ({
            id: m.mediaid,
            title: m.title,
            year: m.releaseyear,
            rating: m.rating,
            poster: m.poster,
            country: m.country,
            language: m.language,
            genre: m.genre || "Drama",
          }));
          setMovies(moviesData);
          setFilteredMovies(moviesData);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    let filtered = [...movies];
    if (filters.country !== "All Countries") {
      filtered = filtered.filter((m) => m.country === filters.country);
    }
    if (filters.language !== "All Languages") {
      filtered = filtered.filter((m) => m.language === filters.language);
    }
    if (filters.genre !== "All Genres") {
      filtered = filtered.filter((m) => m.genre === filters.genre);
    }
    if (searchQuery) {
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    setFilteredMovies(filtered);
  }, [filters, searchQuery, movies]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("LOGOUT BUTTON CLICKED!");

    // Clear ALL storage
    localStorage.clear();
    sessionStorage.clear();

    // Hard refresh to login
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  return (
    <div className="movies-page">
      <nav className="movies-navbar">
        <div className="nav-left">
          <h1 className="logo">FILMLORE</h1>
          <div className="nav-links">
            <a href="/movies" className="nav-link active">
              <Film size={20} />
              <span>Movies</span>
            </a>
            <a href="/series" className="nav-link">
              <Tv size={20} />
              <span>Series</span>
            </a>
            <a href="/blog" className="nav-link">
              <BookOpen size={20} />
              <span>Blog</span>
            </a>
            <a href="/for-you" className="nav-link">
              <Heart size={20} />
              <span>For You</span>
            </a>
            <a href="/watchlist" className="nav-link">
              <Bookmark size={20} />
              <span>Watchlist</span>
            </a>
            <a href="/dashboard" className="nav-link">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </a>
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

          <div className="user-section">
            <div className="user-info">
              <User size={20} />
              <span className="username">{user?.username || "User"}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-btn-simple"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="filters-container">
        <div className="filters-header">
          <h2>
            <Filter size={24} />
            Filters
          </h2>
          <button
            className="toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"}
          </button>
        </div>

        {showFilters && (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Country</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange("country", e.target.value)}
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Language</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange("language", e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="movies-content">
        <h2 className="results-title">{filteredMovies.length} Movies Found</h2>
        <div className="movies-grid">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <div className="movie-poster">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} />
                ) : (
                  <div className="poster-placeholder">
                    <Film size={48} />
                  </div>
                )}
              </div>
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p className="movie-year">{movie.year}</p>
                <div className="movie-rating">
                  <span>⭐</span>
                  <span>{movie.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="no-results">
            <Film size={64} />
            <p>No movies found with the selected filters.</p>
            <button
              onClick={() =>
                setFilters({
                  country: "All Countries",
                  language: "All Languages",
                  genre: "All Genres",
                })
              }
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
