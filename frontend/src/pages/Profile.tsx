import React from 'react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  // In a real app, fetch user profile from API
  
  return (
    <div className="container">
      <h1>User Profile</h1>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Profile Details</h2>
        <p>This is a placeholder for user profile details.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>User Information</h3>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Email:</strong> john@example.com</p>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>My Tools</h2>
        <p>This section would display the user's active tools.</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button>Edit Profile</button>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default Profile;