import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

// Create a reusable admin panel component with role check
const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const userRoles = user?.attributes?.['custom:roles'] || '';
  const isAdmin = userRoles.split(',').map(r => r.trim()).includes('admin');
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="card" style={{ marginTop: '20px', backgroundColor: '#fff8e1', borderLeft: '4px solid #ffc107' }}>
      <h2>Admin Panel</h2>
      <p>This section is only visible to administrators.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Admin Actions</h3>
        <button style={{ marginRight: '10px', backgroundColor: '#2196f3' }}>Manage Users</button>
        <button style={{ marginRight: '10px', backgroundColor: '#ff9800' }}>System Settings</button>
        <button style={{ backgroundColor: '#4caf50' }}>View Logs</button>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const username = user?.username || 'User';
  const email = user?.attributes?.email || 'email@example.com';
  const name = user?.attributes?.name || username;
  
  return (
    <div className="container">
      <h1>User Profile</h1>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Profile Details</h2>
        
        <div style={{ marginTop: '20px' }}>
          <h3>User Information</h3>
          {isEditing ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsEditing(false);
              // In a real app, save profile changes here
            }}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" type="text" defaultValue={name} />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" defaultValue={email} disabled />
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <button type="submit" style={{ marginRight: '10px' }}>Save</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              {user?.attributes?.['custom:roles'] && (
                <p><strong>Roles:</strong> {user.attributes['custom:roles']}</p>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>My Tools</h2>
        <p>Your recently used tools will appear here.</p>
        
        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '4px', 
            padding: '10px', 
            width: '120px',
            textAlign: 'center'
          }}>
            <div>MCP Chat</div>
            <small>Last used: Today</small>
          </div>
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '4px', 
            padding: '10px', 
            width: '120px',
            textAlign: 'center'
          }}>
            <div>Code Assistant</div>
            <small>Last used: Yesterday</small>
          </div>
        </div>
      </div>
      
      {/* Admin Panel - Only visible to users with admin role */}
      <AdminPanel />
      
      <div style={{ marginTop: '20px' }}>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/dashboard">Back to Dashboard</Link>
        {user?.attributes?.['custom:roles']?.includes('admin') && (
          <>
            {' | '}
            <Link to="/admin">Go to Admin Dashboard</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;