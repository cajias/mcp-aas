import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService from './auth';

interface User {
  username: string;
  email?: string;
  attributes?: Record<string, any>;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock integration for local development and testing
const isMockEnvironment = process.env.NODE_ENV === 'development' || 
  process.env.REACT_APP_COGNITO_USER_POOL_ID?.includes('mocked');

// Mock response for simulating successful authentication in development/test
const createMockUser = (username: string): User => ({
  username,
  email: `${username}@example.com`,
  attributes: {
    given_name: 'Test',
    family_name: 'User',
    email: `${username}@example.com`,
    email_verified: 'true'
  }
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Try to get current authenticated user
        const response = await authService.currentUser();
        
        if (response.success && response.data) {
          setIsAuthenticated(true);
          setUser({
            username: response.data.username,
            email: response.data.attributes?.email,
            attributes: response.data.attributes
          });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // If in mock environment and using test credentials, create a mock user
      if (isMockEnvironment && username === 'test_automation_user') {
        setIsAuthenticated(true);
        setUser(createMockUser(username));
        
        // Store mock token in localStorage for testing
        localStorage.setItem('mockAuthToken', 'mock-jwt-token');
        return true;
      }
      
      // Real authentication with Cognito
      const response = await authService.signIn({ username, password });
      
      if (response.success) {
        setIsAuthenticated(true);
        setUser({
          username: response.data.username,
          email: response.data.attributes?.email,
          attributes: response.data.attributes
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // If in mock environment
      if (isMockEnvironment) {
        localStorage.removeItem('mockAuthToken');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // Real logout
      await authService.signOut();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get token function
  const getToken = (): string | null => {
    if (isMockEnvironment) {
      return localStorage.getItem('mockAuthToken');
    }
    
    // In a real app, this would retrieve the JWT token from Cognito
    // This is a simplified version for the example
    return localStorage.getItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};