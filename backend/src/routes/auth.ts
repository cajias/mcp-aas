import { Router } from 'express';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider';

const router = Router();

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Get Cognito configurations from environment variables
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'YOUR_USER_POOL_ID';
const CLIENT_ID = process.env.COGNITO_CLIENT_ID || 'YOUR_CLIENT_ID';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const params = {
      ClientId: CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    };

    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);

    return res.status(200).json({
      success: true,
      data: {
        ...response.AuthenticationResult,
        username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed'
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, given_name, family_name } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, and email are required'
      });
    }

    const params = {
      ClientId: CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        }
      ]
    };

    // Add optional attributes if provided
    if (given_name) {
      params.UserAttributes.push({
        Name: 'given_name',
        Value: given_name
      });
    }

    if (family_name) {
      params.UserAttributes.push({
        Name: 'family_name',
        Value: family_name
      });
    }

    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);

    return res.status(201).json({
      success: true,
      data: {
        username,
        userConfirmed: response.UserConfirmed,
        userSub: response.UserSub
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

// Confirm registration route
router.post('/confirm', async (req, res) => {
  try {
    const { username, code } = req.body;

    if (!username || !code) {
      return res.status(400).json({
        success: false,
        error: 'Username and confirmation code are required'
      });
    }

    const params = {
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: code
    };

    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);

    return res.status(200).json({
      success: true,
      data: {
        message: 'User confirmed successfully'
      }
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Confirmation failed'
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const params = {
      AccessToken: accessToken
    };

    const command = new GlobalSignOutCommand(params);
    await cognitoClient.send(command);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Logout failed'
    });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    const params = {
      ClientId: CLIENT_ID,
      Username: username
    };

    const command = new ForgotPasswordCommand(params);
    await cognitoClient.send(command);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password reset code sent successfully'
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to request password reset'
    });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { username, code, newPassword } = req.body;

    if (!username || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Username, confirmation code, and new password are required'
      });
    }

    const params = {
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword
    };

    const command = new ConfirmForgotPasswordCommand(params);
    await cognitoClient.send(command);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password reset successfully'
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to reset password'
    });
  }
});

export const authRoutes = router;