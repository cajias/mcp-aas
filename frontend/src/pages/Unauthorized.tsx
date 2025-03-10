import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Access Denied</h1>
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '20px', 
          marginTop: '20px', 
          borderRadius: '4px', 
          color: '#d32f2f',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <p>
            <strong>Sorry, {user?.username || 'User'}!</strong> You don't have permission to access this page.
          </p>
          <p>
            Please contact your administrator if you believe you should have access.
          </p>
        </div>
        <div style={{ marginTop: '30px' }}>
          <Link to="/dashboard">Return to Dashboard</Link>
          {' | '}
          <Link to="/">Go to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;