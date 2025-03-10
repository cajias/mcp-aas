import { Amplify } from 'aws-amplify';

// Configuration from environment variables
const cognitoConfig = {
  Auth: {
    region: process.env.REACT_APP_COGNITO_REGION || 'us-east-1',
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID, 
    userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID,
    identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID,
    oauth: {
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:3000/', // Local development
      redirectSignOut: 'http://localhost:3000/', // Local development 
      responseType: 'code'
    }
  }
};

export const configureAmplify = () => {
  // Log the configuration for debugging
  console.log('Amplify configuration:', JSON.stringify(cognitoConfig, null, 2));
  
  Amplify.configure(cognitoConfig);
};

export default cognitoConfig;