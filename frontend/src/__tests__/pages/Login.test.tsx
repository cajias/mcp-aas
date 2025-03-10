import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthProvider, useAuth } from '../../services/AuthContext';

// Mock useAuth hook
jest.mock('../../services/AuthContext', () => {
  const originalModule = jest.requireActual('../../services/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn()
  };
});

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => jest.fn()
  };
});

// Mock PageLayout component to simplify testing
jest.mock('../../components/layout/PageLayout', () => ({
  __esModule: true,
  default: function MockPageLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-layout">{children}</div>;
  }
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useAuth
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      loading: false
    });
  });
  
  it('should render login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
  
  it('should handle form input changes', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });
  
  it('should call login function on form submission', async () => {
    mockLogin.mockResolvedValue(true);
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
  });
  
  it('should show error message on login failure', async () => {
    mockLogin.mockResolvedValue(false);
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });
  
  it('should show loading state during login process', async () => {
    // Mock login to be a slow operation
    mockLogin.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(true), 100);
    }));
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Check that loading state is shown
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
  
  it('should validate form fields before submission', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Try to submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    // Login should not be called because the form is invalid
    expect(mockLogin).not.toHaveBeenCalled();
    
    // Error messages should be displayed
    expect(screen.getByText(/username and password are required/i)).toBeInTheDocument();
  });
  
  it('should navigate to registration page when register link is clicked', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Find specifically the register link that appears after "Don't have an account?"
    const accountText = screen.getByText(/don't have an account\?/i);
    const registerLink = accountText.nextElementSibling || 
                         Array.from(accountText.parentElement?.querySelectorAll('a') || [])
                           .find(a => a.textContent?.includes('Register'));
    
    expect(registerLink).toHaveAttribute('href', '/register');
  });
  
  it('should navigate to forgot password page when forgot password link is clicked', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Find the "Forgot Password?" link within the form context
    const forgotPasswordLinks = screen.getAllByText(/forgot password\?/i);
    const forgotPasswordLink = forgotPasswordLinks.find(element => 
      element.tagName.toLowerCase() === 'a' || element.closest('a')
    ) || forgotPasswordLinks[0];
    
    const linkElement = forgotPasswordLink.tagName.toLowerCase() === 'a' ? 
      forgotPasswordLink : forgotPasswordLink.closest('a');
    
    expect(linkElement).toHaveAttribute('href', '/forgot-password');
  });
});