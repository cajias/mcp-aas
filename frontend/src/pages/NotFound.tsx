import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/">
          <button style={{ marginTop: '20px' }}>Go to Home</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;