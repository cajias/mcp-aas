import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword || !givenName || !familyName) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Register user with Cognito
      const response = await authService.signUp({
        username,
        password,
        email,
        givenName,
        familyName
      });
      
      if (response.success) {
        console.log('Registration successful:', response.data);
        
        // Move to verification step
        setVerificationStep(true);
        setError('');
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Confirm sign up with verification code
      const response = await authService.confirmSignUp(username, verificationCode);
      
      if (response.success) {
        console.log('Verification successful:', response.data);
        
        // Redirect to login page
        navigate('/login', { state: { verified: true } });
      } else {
        setError(response.error || 'Verification failed. Please check your code and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your code and try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div style={{ maxWidth: '500px', margin: '40px auto' }}>
        <div className="card">
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {verificationStep ? 'Verify Your Account' : 'Register'}
          </h1>
          
          {error && (
            <div style={{ backgroundColor: '#ffebee', padding: '10px', marginBottom: '20px', borderRadius: '4px', color: 'var(--error-color)' }}>
              {error}
            </div>
          )}
          
          {!verificationStep ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="givenName">First Name</label>
                  <input
                    type="text"
                    id="givenName"
                    value={givenName}
                    onChange={(e) => setGivenName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="familyName">Last Name</label>
                  <input
                    type="text"
                    id="familyName"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
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
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit}>
              <div className="form-group">
                <p style={{ marginBottom: '15px' }}>
                  We've sent a verification code to your email address. Please enter it below to verify your account.
                </p>
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
            </form>
          )}
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Already have an account? <Link to="/login">Login</Link></p>
            <p><Link to="/">Back to Home</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;