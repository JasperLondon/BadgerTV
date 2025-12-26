/**
 * AWS Amplify Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Cognito User Pool in AWS Console
 * 2. Create an App Client (uncheck "Generate client secret")
 * 3. Replace the placeholder values below with your actual AWS resources
 * 4. For production, use environment variables or aws-exports.js from Amplify CLI
 */

const awsConfig = {
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_YgjKrj0BI',
    // OPTIONAL - Amazon Cognito Web Client ID (App Client ID)
    userPoolClientId: '7u348fnoq6kujpmf0assoe9spq',
  },

  API: {
    endpoints: [
      {
        name: 'BadgerTVAPI',
        endpoint: 'https://enbblgoxg9.execute-api.us-east-1.amazonaws.com/prod',
        region: 'us-east-1'
      }
    ]
  },

  Storage: {
    AWSS3: {
      bucket: 'badgertv-videos',
      region: 'us-east-1',
    }
  }
};

export default awsConfig;
