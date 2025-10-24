/**
 * Login Page Component
 * Handles user authentication with JWT tokens
 */
import React, { useState } from 'react';
import './Login.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    organizationName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // FastAPI expects form data for login (OAuth2 compatible)
      const formBody = new URLSearchParams();
      formBody.append('username', formData.email); // Can use email or username
      formBody.append('password', formData.password);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Store token and user info
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          full_name: formData.fullName,
          organization_name: formData.organizationName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();

      // Store token and user info
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoUser = (email, password) => {
    setFormData({
      ...formData,
      email,
      password
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🤖 Super Agent Framework</h1>
          <p>Enterprise Multi-Agent Orchestration Platform</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {isLogin ? (
          // LOGIN FORM
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email or Username</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@acme.com"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="demo-users">
              <p><strong>Demo Users:</strong></p>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => loadDemoUser('admin@acme.com', 'admin123')}
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => loadDemoUser('dev@acme.com', 'dev123')}
                >
                  💻 Developer
                </button>
                <button
                  type="button"
                  className="demo-button"
                  onClick={() => loadDemoUser('ops@acme.com', 'ops123')}
                >
                  ⚙️ Operator
                </button>
              </div>
            </div>
          </form>
        ) : (
          // REGISTER FORM
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="yourusername"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                placeholder="Your Company"
                required
              />
              <small>Creates a new organization (you'll be admin)</small>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>🔐 Secured with JWT Authentication</p>
          <p>🏢 Multi-Tenancy Enabled</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
