import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../services/AuthContext';
import authService from '../../services/auth';

// Mock auth service
jest.mock('../../services/auth', () => ({
  __esModule: true,
  default: {
    currentUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Create a test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, user, loading, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="username">{user?.username || 'No user'}</div>
      <button 
        data-testid="login-button" 
        onClick={() => login('testuser', 'password')}
      >
        Login
      </button>
      <button 
        data-testid="logout-button" 
        onClick={() => logout()}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('should check authentication status on load', async () => {
    // Mock the currentUser method to return an authenticated user
    (authService.currentUser as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        username: 'testuser',
        attributes: {
          email: 'test@example.com'
        }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should show loading
    expect(screen.getByTestId('loading').textContent).toBe('Loading...');

    // After auth check completes, should show authenticated
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not loading');
      expect(screen.getByTestId('authenticated').textContent).toBe('Authenticated');
      expect(screen.getByTestId('username').textContent).toBe('testuser');
    });

    expect(authService.currentUser).toHaveBeenCalledTimes(1);
  });

  it('should handle unauthenticated state on load', async () => {
    // Mock the currentUser method to return no authenticated user
    (authService.currentUser as jest.Mock).mockResolvedValue({
      success: false,
      error: 'No current user'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // After auth check completes, should show not authenticated
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('Not authenticated');
      expect(screen.getByTestId('username').textContent).toBe('No user');
    });

    expect(authService.currentUser).toHaveBeenCalledTimes(1);
  });

  it('should handle login successfully', async () => {
    // Mock the currentUser method to return no authenticated user initially
    (authService.currentUser as jest.Mock).mockResolvedValue({
      success: false
    });

    // Mock the signIn method to return success
    (authService.signIn as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        username: 'testuser',
        attributes: {
          email: 'test@example.com'
        }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not loading');
    });

    // Click login button
    await act(async () => {
      screen.getByTestId('login-button').click();
    });

    // Should show authenticated after login
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('Authenticated');
      expect(screen.getByTestId('username').textContent).toBe('testuser');
    });

    expect(authService.signIn).toHaveBeenCalledWith({ 
      username: 'testuser', 
      password: 'password' 
    });
  });

  it('should handle login failure', async () => {
    // Mock the currentUser method to return no authenticated user
    (authService.currentUser as jest.Mock).mockResolvedValue({
      success: false
    });

    // Mock the signIn method to return failure
    (authService.signIn as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not loading');
    });

    // Click login button
    await act(async () => {
      screen.getByTestId('login-button').click();
    });

    // Should remain unauthenticated after failed login
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('Not authenticated');
      expect(screen.getByTestId('username').textContent).toBe('No user');
    });

    expect(authService.signIn).toHaveBeenCalled();
  });

  it('should handle logout', async () => {
    // Mock the currentUser method to return an authenticated user
    (authService.currentUser as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        username: 'testuser',
        attributes: {
          email: 'test@example.com'
        }
      }
    });

    // Mock the signOut method to return success
    (authService.signOut as jest.Mock).mockResolvedValue({
      success: true
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial auth check to complete and show authenticated
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('Authenticated');
    });

    // Click logout button
    await act(async () => {
      screen.getByTestId('logout-button').click();
    });

    // Should show not authenticated after logout
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('Not authenticated');
      expect(screen.getByTestId('username').textContent).toBe('No user');
    });

    expect(authService.signOut).toHaveBeenCalledTimes(1);
  });

  it('should use mock authentication in development environment', async () => {
    // Save original environment
    const originalEnv = process.env.NODE_ENV;
    
    // Set development environment
    process.env.NODE_ENV = 'development';
    
    // Mock the currentUser method to return no authenticated user initially
    (authService.currentUser as jest.Mock).mockResolvedValue({
      success: false
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Not loading');
    });

    // Click login button with test user credentials
    await act(async () => {
      // We need to re-render the component because we changed environment
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Trigger login with test credentials
      const loginButton = screen.getAllByTestId('login-button')[0];
      loginButton.click();
    });

    // Mock implementation for test user should bypass real auth
    expect(authService.signIn).not.toHaveBeenCalled();
    
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });
});