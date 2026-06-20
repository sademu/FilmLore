import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, BookOpen, Heart, Bookmark, LayoutDashboard, User, LogOut, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SeriesPage.css';

const SeriesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [user, setUser] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    country: 'All Countries',
    language: 'All Languages',
    genre: 'All Genres'
  });

  // Sample filter options (you can fetch these from backend)
  const countries = ['All Countries', 'America', 'Canada', 'Korea', 'Japan', 'France', 'UK'];
  const languages = ['All Languages', 'English', 'Korean', 'Japanese', 'French', 'Spanish'];
  const genres = ['All Genres', 'Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror', 'Romance'];

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  // Fetch series from backend
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch("${process.env.REACT_APP_API_URL}/api/series");
        const json = await res.json();
        
        if (json.success) {
          const seriesData = json.data.map((s) => ({
            id: s.mediaid,
            title: s.title,
            year: s.releaseyear,
            rating: s.rating,
            poster: s.poster,
            country: s.country,
            language: s.language,
            genre: s.genre || 'Drama'
          }));
          setSeries(seriesData);
          setFilteredSeries(seriesData);
        }
      } catch (err) {
        console.error('Error fetching series:', err);
      }
    };

    fetchSeries();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...series];

    // Filter by country
    if (filters.country !== 'All Countries') {
      filtered = filtered.filter(s => s.country === filters.country);
    }

    // Filter by language
    if (filters.language !== 'All Languages') {
      filtered = filtered.filter(s => s.language === filters.language);
    }

    // Filter by genre
    if (filters.genre !== 'All Genres') {
      filtered = filtered.filter(s => s.genre === filters.genre);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSeries(filtered);
  }, [filters, searchQuery, series]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const addToWatchlist = (seriesId) => {
    // TODO: Implement add to watchlist API call
    console.log('Add to watchlist:', seriesId);
  };

  return (
   
    <div className="series-page">
      {/* Navigation */}
      <nav className="series-navbar">
        <div className="nav-left">
          <h1 className="logo">FILMLORE</h1>
          <div className="nav-links">
            <a href="/movies" className="nav-link">
              <Film size={20} />
              <span>Movies</span>
            </a>
            <a href="/series" className="nav-link active">
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
              placeholder="Search series, shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="user-menu">
            <button className="user-icon">
              <User size={20} />
            </button>
            <div className="user-dropdown">
              <p className="user-name">{user?.username || 'User'}</p>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Filters Section */}
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
            {showFilters ? 'Hide' : 'Show'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Country</label>
              <select 
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Language</label>
              <select 
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Genre</label>
              <select 
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Series Grid */}
      <div className="series-content">
        <h2 className="results-title">{filteredSeries.length} Series Found</h2>
        
        <div className="series-grid">
          {filteredSeries.map((show) => (
            <div 
              key={show.id} 
              className="series-card"
              onClick={() => navigate(`/series/${show.id}`)}
            >

            <div key={show.id} className="series-card">
              <div className="series-poster">
                {show.poster ? (
                  <img src={show.poster} alt={show.title} />
                ) : (
                  <div className="poster-placeholder">
                    <Tv size={48} />
                  </div>
                )}
                <button 
                  className="watchlist-btn"
                  onClick={() => addToWatchlist(show.id)}
                >
                  <Bookmark size={20} />
                </button>
              </div>
              <div className="series-info">
                <h3>{show.title}</h3>
                <p className="series-year">{show.year}</p>
                <div className="series-rating">
                  <span>⭐</span>
                  <span>{show.rating}</span>
                </div>
              </div>
            </div>
            </div>
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="no-results">
            <Tv size={64} />
            <p>No series found with the selected filters.</p>
            <button onClick={() => setFilters({
              country: 'All Countries',
              language: 'All Languages',
              genre: 'All Genres'
            })}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
    
    
  );
};

export default SeriesPage;
