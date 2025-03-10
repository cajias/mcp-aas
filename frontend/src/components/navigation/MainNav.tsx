import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

const MainNav: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const isAdmin = user?.attributes?.['custom:roles']?.includes('admin');
  
  return (
    <nav style={{ 
      padding: '15px 20px', 
      backgroundColor: '#f5f5f5', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      borderRadius: '4px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div>
          <Link to="/" style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            textDecoration: 'none', 
            color: '#333'
          }}>
            MCP-aaS
          </Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333' }}>Dashboard</Link>
              <Link to="/profile" style={{ textDecoration: 'none', color: '#333' }}>Profile</Link>
              
              {isAdmin && (
                <Link to="/admin" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Admin</Link>
              )}
              
              <button 
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
              
              <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                {user?.username}
              </span>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>Login</Link>
              <Link to="/register" style={{ textDecoration: 'none', color: '#333' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNav;