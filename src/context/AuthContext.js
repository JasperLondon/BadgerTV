import React, { createContext, useState, useEffect, useContext } from 'react';
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, updatePassword, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import awsConfig from '../config/aws-config';

// Configure Amplify with AsyncStorage
Amplify.configure(awsConfig, {
  storage: AsyncStorage
});

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(true); // Guest mode by default

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      setUser({ username, userId, signInDetails });
      setIsGuest(false);
    } catch (err) {
      // User is not logged in - allow guest access
      setUser(null);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  const signUpUser = async (username, email, password) => {
    try {
      setError(null);
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: true
        }
      });
      return { success: true, isSignUpComplete, userId, nextStep };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const confirmSignUpUser = async (username, code) => {
    try {
      setError(null);
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username,
        confirmationCode: code
      });
      return { success: true, isSignUpComplete, nextStep };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resendConfirmationCode = async (username) => {
    try {
      setError(null);
      await resendSignUpCode({ username });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signInUser = async (username, password) => {
    try {
      setError(null);
      const { isSignedIn, nextStep } = await signIn({ username, password });
      if (isSignedIn) {
        const { username: currentUsername, userId, signInDetails } = await getCurrentUser();
        setUser({ username: currentUsername, userId, signInDetails });
        setIsGuest(false);
      }
      return { success: true, isSignedIn, nextStep };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signOutUser = async () => {
    try {
      setError(null);
      await signOut();
      setUser(null);
      setIsGuest(true);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const forgotPassword = async (username) => {
    try {
      setError(null);
      const output = await resetPassword({ username });
      return { success: true, ...output };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const forgotPasswordSubmit = async (username, code, newPassword) => {
    try {
      setError(null);
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword
      });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setError(null);
      await updatePassword({ oldPassword, newPassword });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const getCurrentUserData = async () => {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (err) {
      return null;
    }
  };

  const getUserToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (err) {
      return null;
    }
  };

  const value = {
    user,
    loading,
    error,
    isGuest,
    signUp: signUpUser,
    confirmSignUp: confirmSignUpUser,
    resendConfirmationCode,
    signIn: signInUser,
    signOut: signOutUser,
    forgotPassword,
    forgotPasswordSubmit,
    changePassword,
    getCurrentUser: getCurrentUserData,
    getUserToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
