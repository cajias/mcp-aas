import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.username || 'Admin'}</p>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>User Management</h2>
        <p>Manage platform users and their permissions.</p>
        
        <div style={{ marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Username</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>alice</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>alice@example.com</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>admin</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Active</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                  <button style={{ marginRight: '5px', padding: '4px 8px' }}>Edit</button>
                  <button style={{ padding: '4px 8px' }}>Disable</button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>bob</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>bob@example.com</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>user</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Active</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                  <button style={{ marginRight: '5px', padding: '4px 8px' }}>Edit</button>
                  <button style={{ padding: '4px 8px' }}>Disable</button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>charlie</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>charlie@example.com</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>user</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>Inactive</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                  <button style={{ marginRight: '5px', padding: '4px 8px' }}>Edit</button>
                  <button style={{ padding: '4px 8px' }}>Enable</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button>Add New User</button>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>System Statistics</h2>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div style={{ flex: 1, padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>42</div>
            <div>Active Users</div>
          </div>
          <div style={{ flex: 1, padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>157</div>
            <div>Tool Launches</div>
          </div>
          <div style={{ flex: 1, padding: '15px', backgroundColor: '#fff8e1', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>7</div>
            <div>Active Tools</div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/dashboard">Back to User Dashboard</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;