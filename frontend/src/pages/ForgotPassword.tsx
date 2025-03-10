import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth';

const ForgotPassword: React.FC = () => {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Username is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.forgotPassword(username);
      
      if (response.success) {
        setResetRequested(true);
        setSuccess('Password reset code sent to your email. Please check your inbox.');
      } else {
        setError(response.error || 'Failed to request password reset');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !code || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.forgotPasswordSubmit(username, code, newPassword);
      
      if (response.success) {
        setSuccess('Password reset successful. You can now log in with your new password.');
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '40px auto' }}>
        <div className="card">
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {resetRequested ? 'Reset Password' : 'Forgot Password'}
          </h1>
          
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
          
          {!resetRequested ? (
            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p><Link to="/login">Back to Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;