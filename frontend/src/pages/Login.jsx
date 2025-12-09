import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';
import googleLogo from '../assets/google-logo.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      await authService.getUserInfo(codeResponse);
      navigate('/my-images');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(username, password);
      navigate('/my-images');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{width: '100%'}}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <span style={{ display: 'block', marginBottom: '10px', color: '#666' }}>
            OR
          </span>

          <button
            type="button"
            onClick={googleLogin}
            className="btn btn-outline"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: '#333',
              borderRadius: '6px',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            <img
              src={googleLogo}
              alt="Google logo"
              style={{ width: '18px', height: '18px' }}
            />
            <span>Sign in with Google</span>
          </button>
        </div>
        <div className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
