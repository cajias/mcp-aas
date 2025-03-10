import { Auth } from 'aws-amplify';

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  givenName: string;
  familyName: string;
}

export interface SignInParams {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Auth service for handling authentication with AWS Cognito
 */
export class AuthService {
  /**
   * Register a new user
   */
  async signUp({ username, password, email, givenName, familyName }: SignUpParams): Promise<AuthResponse> {
    try {
      const result = await Auth.signUp({
        username,
        password,
        attributes: {
          email,
          given_name: givenName,
          family_name: familyName,
        },
      });
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign up',
      };
    }
  }

  /**
   * Confirm sign up with verification code
   */
  async confirmSignUp(username: string, code: string): Promise<AuthResponse> {
    try {
      const result = await Auth.confirmSignUp(username, code);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error confirming sign up:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm sign up',
      };
    }
  }

  /**
   * Sign in a user
   */
  async signIn({ username, password }: SignInParams): Promise<AuthResponse> {
    try {
      const user = await Auth.signIn(username, password);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in',
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      await Auth.signOut();
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  }

  /**
   * Get the current authenticated user
   */
  async currentUser(): Promise<AuthResponse> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        error: error.message || 'No authenticated user',
      };
    }
  }

  /**
   * Reset password - send verification code
   */
  async forgotPassword(username: string): Promise<AuthResponse> {
    try {
      const result = await Auth.forgotPassword(username);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        error: error.message || 'Failed to request password reset',
      };
    }
  }

  /**
   * Complete password reset with verification code
   */
  async forgotPasswordSubmit(username: string, code: string, newPassword: string): Promise<AuthResponse> {
    try {
      const result = await Auth.forgotPasswordSubmit(username, code, newPassword);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }
  }
}

export default new AuthService();