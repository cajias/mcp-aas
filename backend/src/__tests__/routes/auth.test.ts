// Mock AWS SDK modules
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  return {
    CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
      send: mockSend
    })),
    InitiateAuthCommand: jest.fn(),
    SignUpCommand: jest.fn(),
    ConfirmSignUpCommand: jest.fn(),
    GlobalSignOutCommand: jest.fn(),
    ForgotPasswordCommand: jest.fn(),
    ConfirmForgotPasswordCommand: jest.fn(),
    AuthFlowType: {
      USER_PASSWORD_AUTH: 'USER_PASSWORD_AUTH'
    }
  };
});

// After mocks, import dependencies
import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { json } from 'body-parser';
import { authRoutes } from '../../routes/auth';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider';

describe('Auth Routes', () => {
  let app: express.Application;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create Express app and register auth routes
    app = express();
    app.use(json());
    app.use('/auth', authRoutes);
  });
  
  describe('POST /auth/login', () => {
    it('should successfully authenticate a user', async () => {
      // Set up mock response
      const mockAuthResult = {
        AuthenticationResult: {
          AccessToken: 'mock-access-token',
          IdToken: 'mock-id-token',
          RefreshToken: 'mock-refresh-token',
          ExpiresIn: 3600
        }
      };
      
      mockSend.mockResolvedValue(mockAuthResult);
      
      // Send login request
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!'
        });
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockAuthResult.AuthenticationResult,
          username: 'testuser'
        }
      });
      
      // Verify InitiateAuthCommand was called with correct parameters
      expect(InitiateAuthCommand).toHaveBeenCalledWith({
        ClientId: expect.any(String),
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: 'testuser',
          PASSWORD: 'Password123!'
        }
      });
      
      // Verify the command was sent
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    it('should handle authentication failure', async () => {
      // Set up mock error
      const mockError = new Error('Incorrect username or password.');
      mockSend.mockRejectedValue(mockError);
      
      // Send login request
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'WrongPassword'
        });
      
      // Verify the response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: 'Incorrect username or password.'
      });
    });
    
    it('should validate required fields', async () => {
      // Send login request without required fields
      const response = await request(app)
        .post('/auth/login')
        .send({});
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Username and password are required'
      });
      
      // Command should not be sent
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /auth/register', () => {
    it('should successfully register a new user', async () => {
      // Set up mock response
      const mockSignUpResponse = {
        UserConfirmed: false,
        UserSub: 'mock-user-sub'
      };
      
      mockSend.mockResolvedValue(mockSignUpResponse);
      
      // Send registration request
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          password: 'Password123!',
          email: 'newuser@example.com',
          given_name: 'New',
          family_name: 'User'
        });
      
      // Verify the response
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: {
          username: 'newuser',
          userConfirmed: false,
          userSub: 'mock-user-sub'
        }
      });
      
      // Verify SignUpCommand was called with correct parameters
      expect(SignUpCommand).toHaveBeenCalledWith({
        ClientId: expect.any(String),
        Username: 'newuser',
        Password: 'Password123!',
        UserAttributes: [
          {
            Name: 'email',
            Value: 'newuser@example.com'
          },
          {
            Name: 'given_name',
            Value: 'New'
          },
          {
            Name: 'family_name',
            Value: 'User'
          }
        ]
      });
      
      // Verify the command was sent
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    it('should handle registration failure', async () => {
      // Set up mock error
      const mockError = new Error('User already exists');
      mockSend.mockRejectedValue(mockError);
      
      // Send registration request
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'existinguser',
          password: 'Password123!',
          email: 'existing@example.com'
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'User already exists'
      });
    });
    
    it('should validate required fields', async () => {
      // Send registration request without required fields
      const response = await request(app)
        .post('/auth/register')
        .send({
          password: 'Password123!'
          // Missing username and email
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Username, password, and email are required'
      });
      
      // Command should not be sent
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /auth/confirm', () => {
    it('should successfully confirm a registration', async () => {
      // Set up mock response (empty response for confirmation success)
      mockSend.mockResolvedValue({});
      
      // Send confirmation request
      const response = await request(app)
        .post('/auth/confirm')
        .send({
          username: 'newuser',
          code: '123456'
        });
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'User confirmed successfully'
        }
      });
      
      // Verify ConfirmSignUpCommand was called with correct parameters
      expect(ConfirmSignUpCommand).toHaveBeenCalledWith({
        ClientId: expect.any(String),
        Username: 'newuser',
        ConfirmationCode: '123456'
      });
      
      // Verify the command was sent
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    it('should handle confirmation failure', async () => {
      // Set up mock error
      const mockError = new Error('Invalid verification code');
      mockSend.mockRejectedValue(mockError);
      
      // Send confirmation request
      const response = await request(app)
        .post('/auth/confirm')
        .send({
          username: 'newuser',
          code: 'invalid'
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid verification code'
      });
    });
    
    it('should validate required fields', async () => {
      // Send confirmation request without required fields
      const response = await request(app)
        .post('/auth/confirm')
        .send({
          username: 'newuser'
          // Missing code
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Username and confirmation code are required'
      });
      
      // Command should not be sent
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /auth/logout', () => {
    it('should successfully log out a user', async () => {
      // Set up mock response (empty response for logout success)
      mockSend.mockResolvedValue({});
      
      // Send logout request
      const response = await request(app)
        .post('/auth/logout')
        .send({
          accessToken: 'mock-access-token'
        });
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Logged out successfully'
        }
      });
      
      // Verify GlobalSignOutCommand was called with correct parameters
      expect(GlobalSignOutCommand).toHaveBeenCalledWith({
        AccessToken: 'mock-access-token'
      });
      
      // Verify the command was sent
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    it('should handle logout failure', async () => {
      // Set up mock error
      const mockError = new Error('Invalid access token');
      mockSend.mockRejectedValue(mockError);
      
      // Send logout request
      const response = await request(app)
        .post('/auth/logout')
        .send({
          accessToken: 'invalid-token'
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid access token'
      });
    });
    
    it('should validate required fields', async () => {
      // Send logout request without required fields
      const response = await request(app)
        .post('/auth/logout')
        .send({});
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Access token is required'
      });
      
      // Command should not be sent
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /auth/forgot-password', () => {
    it('should successfully initiate password reset', async () => {
      // Set up mock response (empty response for forgot password success)
      mockSend.mockResolvedValue({});
      
      // Send forgot password request
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({
          username: 'existinguser'
        });
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Password reset code sent successfully'
        }
      });
      
      // Verify ForgotPasswordCommand was called with correct parameters
      expect(ForgotPasswordCommand).toHaveBeenCalledWith({
        ClientId: expect.any(String),
        Username: 'existinguser'
      });
      
      // Verify the command was sent
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    it('should handle forgot password failure', async () => {
      // Set up mock error
      const mockError = new Error('User does not exist');
      mockSend.mockRejectedValue(mockError);
      
      // Send forgot password request
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({
          username: 'nonexistentuser'
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'User does not exist'
      });
    });
    
    it('should validate required fields', async () => {
      // Send forgot password request without required fields
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({});
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Username is required'
      });
      
      // Command should not be sent
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /auth/reset-password', () => {
    it('should successfully reset password', async () => {
      // Set up mock response (empty response for reset password success)
      mockSend.mockResolvedValue({});
      
      // Send reset password request
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          username: 'existinguser',
          code: '123456',
          newPassword: 'NewPassword123!'
        });
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          message: 'Password reset successfully'
        }
      });
      
      // Verify ConfirmForgotPasswordCommand was called with correct parameters
      expect(ConfirmForgotPasswordCommand).toHaveBeenCalledWith({
        ClientId: expect.any(String),
        Username: 'existinguser',
        ConfirmationCode: '123456',
        Password: 'NewPassword123!'
      });
      
      // Verify the command was sent
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    it('should handle reset password failure', async () => {
      // Set up mock error
      const mockError = new Error('Invalid verification code');
      mockSend.mockRejectedValue(mockError);
      
      // Send reset password request
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          username: 'existinguser',
          code: 'invalid',
          newPassword: 'NewPassword123!'
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid verification code'
      });
    });
    
    it('should validate required fields', async () => {
      // Send reset password request without required fields
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          username: 'existinguser',
          code: '123456'
          // Missing newPassword
        });
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Username, confirmation code, and new password are required'
      });
      
      // Command should not be sent
      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});