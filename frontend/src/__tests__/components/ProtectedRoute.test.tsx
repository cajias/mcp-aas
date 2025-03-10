import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../services/AuthContext';

// Mock the useAuth hook
jest.mock('../../services/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should show loading indicator when authentication is loading', () => {
    // Mock the useAuth hook to simulate loading state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true
    });
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should redirect to login when not authenticated', () => {
    // Mock the useAuth hook to simulate unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    
    // We need to use the full Routes setup to test navigation
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/protected" element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    
    // Should render the login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should render children when authenticated', () => {
    // Mock the useAuth hook to simulate authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { username: 'testuser', attributes: {} },
      loading: false
    });
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Should render the protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  it('should check roles when specified and allow access when user has required role', () => {
    // Mock the useAuth hook to simulate authenticated state with admin role
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { 
        username: 'admin', 
        attributes: { 'custom:roles': 'admin,user' }
      },
      loading: false
    });
    
    render(
      <MemoryRouter>
        <ProtectedRoute roles={['admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Should render the admin content
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
  
  it('should redirect to unauthorized when user does not have required role', () => {
    // Mock the useAuth hook to simulate authenticated state without admin role
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { 
        username: 'user', 
        attributes: { 'custom:roles': 'user' }
      },
      loading: false
    });
    
    // We need to use the full Routes setup to test navigation
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    
    // Should render the unauthorized page
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});