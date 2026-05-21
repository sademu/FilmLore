import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Array of background images for dynamic changes
  const backgrounds = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920',
    'https://images.unsplash.com/photo-1574267432644-f610a43f9e1e?w=1920',
    'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1920',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920'
  ];

  // Change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleExploreAsGuest = () => {
    navigate('/home');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* Dynamic Background */}
      <div className="background-slider">
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`background-image ${index === currentBgIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
        <div className="overlay" />
      </div>

      {/* Content */}
      <div className="landing-content">
        <h1 className="landing-title">FILMLORE</h1>
        <p className="landing-subtitle">
          Discover the stories behind every frame. Your cinematic journey begins here.
        </p>

        <div className="landing-buttons">
          <button className="btn-primary" onClick={handleSignIn}>
            Sign In / Sign Up
          </button>
          <button className="btn-secondary" onClick={handleExploreAsGuest}>
            Explore as Guest
          </button>
        </div>

        <footer className="landing-footer">
          <p>Powered by PERN Stack</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
