import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tool } from '@mcp-aas/shared';
import { useAuth } from '../services/AuthContext';

const Dashboard: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

    // Fetch tools
    const fetchTools = async () => {
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockTools: Tool[] = [
          {
            id: 'tool-1',
            name: 'MCP Code Assistant',
            description: 'AI-powered code assistant',
            category: 'developer',
            icon: 'code-icon.png',
            version: '1.0.0',
            status: 'active'
          },
          {
            id: 'tool-2',
            name: 'MCP Chat',
            description: 'AI chat interface',
            category: 'communication',
            icon: 'chat-icon.png',
            version: '1.0.0',
            status: 'active'
          },
          {
            id: 'tool-3',
            name: 'MCP Data Analyzer',
            description: 'Data analysis and visualization',
            category: 'analytics',
            icon: 'data-icon.png',
            version: '1.0.0',
            status: 'active'
          }
        ];
        
        setTools(mockTools);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, [navigate]);
  
  const handleLaunchTool = (toolId: string) => {
    console.log(`Launching tool: ${toolId}`);
    // In a real app, this would make an API call to launch the tool
    // and then redirect to a connection page or open a WebSocket
    window.alert(`Tool ${toolId} launched! In a real app, this would connect to the tool.`);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Dashboard</h1>
        <button 
          onClick={handleLogout}
          aria-label="Logout"
          style={{ padding: '8px 16px' }}
        >
          Logout
        </button>
      </div>
      
      <p className="user-welcome">Welcome to your MCP-aaS dashboard, {user?.username || 'User'}.</p>
      
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>Loading tools...</p>
        </div>
      ) : error ? (
        <div style={{ backgroundColor: '#ffebee', padding: '20px', marginTop: '20px', borderRadius: '4px', color: 'var(--error-color)' }}>
          {error}
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h2>Available Tools</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {tools.map(tool => (
              <div key={tool.id} className="card">
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Version: {tool.version}</p>
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => handleLaunchTool(tool.id)}>
                    Launch
                  </button>
                  
                  <Link to={`/tools/${tool.id}`}>
                    <button style={{ backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>
                      Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default Dashboard;