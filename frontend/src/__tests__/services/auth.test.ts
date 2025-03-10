import { Auth } from 'aws-amplify';
import authService, { AuthService } from '../../services/auth';

// Mock AWS Amplify Auth
jest.mock('aws-amplify', () => ({
  Auth: {
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    currentAuthenticatedUser: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn(),
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const mockSignUpParams = {
      username: 'testuser',
      password: 'Password123!',
      email: 'test@example.com',
      givenName: 'Test',
      familyName: 'User'
    };

    it('should successfully sign up a user', async () => {
      const mockResponse = { user: { username: 'testuser' } };
      (Auth.signUp as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.signUp(mockSignUpParams);

      expect(Auth.signUp).toHaveBeenCalledWith({
        username: mockSignUpParams.username,
        password: mockSignUpParams.password,
        attributes: {
          email: mockSignUpParams.email,
          given_name: mockSignUpParams.givenName,
          family_name: mockSignUpParams.familyName,
        }
      });
      expect(result).toEqual({
        success: true,
        data: mockResponse
      });
    });

    it('should handle sign up failure', async () => {
      const mockError = new Error('User already exists');
      (Auth.signUp as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.signUp(mockSignUpParams);

      expect(Auth.signUp).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'User already exists'
      });
    });
  });

  describe('confirmSignUp', () => {
    it('should successfully confirm sign up', async () => {
      const mockResponse = { success: true };
      (Auth.confirmSignUp as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.confirmSignUp('testuser', '123456');

      expect(Auth.confirmSignUp).toHaveBeenCalledWith('testuser', '123456');
      expect(result).toEqual({
        success: true,
        data: mockResponse
      });
    });

    it('should handle confirm sign up failure', async () => {
      const mockError = new Error('Invalid verification code');
      (Auth.confirmSignUp as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.confirmSignUp('testuser', 'invalid');

      expect(Auth.confirmSignUp).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Invalid verification code'
      });
    });
  });

  describe('signIn', () => {
    const mockSignInParams = {
      username: 'testuser',
      password: 'Password123!'
    };

    it('should successfully sign in a user', async () => {
      const mockUser = { 
        username: 'testuser',
        attributes: {
          email: 'test@example.com',
          given_name: 'Test',
          family_name: 'User'
        }
      };
      (Auth.signIn as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.signIn(mockSignInParams);

      expect(Auth.signIn).toHaveBeenCalledWith(
        mockSignInParams.username, 
        mockSignInParams.password
      );
      expect(result).toEqual({
        success: true,
        data: mockUser
      });
    });

    it('should handle sign in failure', async () => {
      const mockError = new Error('Incorrect username or password');
      (Auth.signIn as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.signIn(mockSignInParams);

      expect(Auth.signIn).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Incorrect username or password'
      });
    });
  });

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      (Auth.signOut as jest.Mock).mockResolvedValue({});

      const result = await authService.signOut();

      expect(Auth.signOut).toHaveBeenCalled();
      expect(result).toEqual({
        success: true
      });
    });

    it('should handle sign out failure', async () => {
      const mockError = new Error('Network error');
      (Auth.signOut as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.signOut();

      expect(Auth.signOut).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });
  });

  describe('currentUser', () => {
    it('should return the current authenticated user', async () => {
      const mockUser = { 
        username: 'testuser',
        attributes: {
          email: 'test@example.com'
        }
      };
      (Auth.currentAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.currentUser();

      expect(Auth.currentAuthenticatedUser).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockUser
      });
    });

    it('should handle no authenticated user', async () => {
      const mockError = new Error('No current user');
      (Auth.currentAuthenticatedUser as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.currentUser();

      expect(Auth.currentAuthenticatedUser).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'No current user'
      });
    });
  });

  describe('forgotPassword', () => {
    it('should request a password reset', async () => {
      const mockResponse = { success: true };
      (Auth.forgotPassword as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword('testuser');

      expect(Auth.forgotPassword).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({
        success: true,
        data: mockResponse
      });
    });

    it('should handle forgotPassword failure', async () => {
      const mockError = new Error('User does not exist');
      (Auth.forgotPassword as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.forgotPassword('nonexistent');

      expect(Auth.forgotPassword).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'User does not exist'
      });
    });
  });

  describe('forgotPasswordSubmit', () => {
    it('should successfully reset password', async () => {
      const mockResponse = { success: true };
      (Auth.forgotPasswordSubmit as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.forgotPasswordSubmit(
        'testuser', 
        '123456', 
        'NewPassword123!'
      );

      expect(Auth.forgotPasswordSubmit).toHaveBeenCalledWith(
        'testuser', 
        '123456', 
        'NewPassword123!'
      );
      expect(result).toEqual({
        success: true,
        data: mockResponse
      });
    });

    it('should handle forgotPasswordSubmit failure', async () => {
      const mockError = new Error('Invalid verification code');
      (Auth.forgotPasswordSubmit as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.forgotPasswordSubmit(
        'testuser', 
        'invalid', 
        'NewPassword123!'
      );

      expect(Auth.forgotPasswordSubmit).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Invalid verification code'
      });
    });
  });
});