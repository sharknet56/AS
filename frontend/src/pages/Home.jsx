import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

function Home() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="home-container">
      <h1>Welcome to ImageShare</h1>
      <p>A secure platform to share and comment on images</p>
      
      <div className="home-actions">
        {isAuthenticated ? (
          <>
            <Link to="/my-images" className="btn btn-primary">
              My Images
            </Link>
            <Link to="/explore" className="btn btn-primary">
              Explore Images
            </Link>
          </>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
