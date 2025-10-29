// src/amplifyConfig.js
// ✅ Works with Amplify v6+ modular packages

import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut, getCurrentUser } from '@aws-amplify/auth'; // optional functions for tree-shaking

Amplify.configure({
  Auth: {
    Cognito: {
      region: 'us-east-1', // your AWS region
      userPoolId: 'us-east-1_1SSY4L4we', // your User Pool ID
      userPoolClientId: '62616b9v2ku37c5u46iev5c15o', // your SPA client ID
    },
  },
});
