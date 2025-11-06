import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const username = authService.getUsername();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        📸 ImageShare
      </Link>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/my-images" className="navbar-link">My Images</Link>
            <Link to="/explore" className="navbar-link">Explore</Link>
            <div className="navbar-user">
              <span className="navbar-username">👤 {username}</span>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
