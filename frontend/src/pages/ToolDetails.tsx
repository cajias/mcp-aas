import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ToolDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, fetch tool details from API based on id
  
  return (
    <div className="container">
      <h1>Tool Details</h1>
      <p>Tool ID: {id}</p>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Tool Name</h2>
        <p>This is a placeholder for tool details. In a real app, this would fetch and display details for tool with ID: {id}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button>Launch Tool</button>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default ToolDetails;