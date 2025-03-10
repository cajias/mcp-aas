import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/auth';
import { useAuth } from '../services/AuthContext';

interface LocationState {
  verified?: boolean;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check for verification state passed from registration
    const state = location.state as LocationState;
    if (state?.verified) {
      setSuccess('Email verified successfully! Please login with your credentials.');
    }
  }, [location]);
  
  // Import auth context
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use the Auth context to login
      const success = await login(username, password);
      
      if (success) {
        console.log('Login successful');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '40px auto' }}>
        <div className="card">
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h1>
          
          {error && (
            <div style={{ backgroundColor: '#ffebee', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: 'var(--error-color)' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message" style={{ backgroundColor: '#e8f5e9', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: '#2e7d32' }}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Don&apos;t have an account? <Link to="/register">Register</Link></p>
            <p><Link to="/forgot-password">Forgot Password?</Link></p>
            <p><Link to="/">Back to Home</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;