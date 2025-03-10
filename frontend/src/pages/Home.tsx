import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>MCP as a Service</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Launch and use Model Context Protocol tools without installing them locally
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <Link to="/login">
          <button style={{ marginRight: '20px' }}>Login</button>
        </Link>
        <Link to="/dashboard">
          <button>Try Demo</button>
        </Link>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div className="card" style={{ flex: '1 1 300px', margin: '10px' }}>
          <h2>On-Demand Tools</h2>
          <p>Access powerful MCP tools instantly without any installation or setup</p>
        </div>

        <div className="card" style={{ flex: '1 1 300px', margin: '10px' }}>
          <h2>Easy Management</h2>
          <p>Start, stop, and manage your tools from a simple dashboard</p>
        </div>

        <div className="card" style={{ flex: '1 1 300px', margin: '10px' }}>
          <h2>WebSocket Connections</h2>
          <p>Fast, reliable connections to your tools through WebSockets</p>
        </div>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '40px', padding: '20px', borderTop: '1px solid var(--border-color)' }}>
        <p>&copy; 2025 MCP-aaS</p>
      </footer>
    </div>
  );
};

export default Home;