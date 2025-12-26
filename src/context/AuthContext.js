import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';


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
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setIsGuest(false);
    } else {
      setUser(null);
      setIsGuest(true);
    }
    setLoading(false);
  };

  const signUpUser = async (email, _unused, password) => {
    // _unused is for compatibility with old username param
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
    setUser(data.user);
    setIsGuest(false);
    return { success: true, user: data.user };
  };

  // Supabase handles email confirmation automatically. No need for confirmSignUp or resendConfirmationCode.
  const confirmSignUpUser = async () => ({ success: true });
  const resendConfirmationCode = async () => ({ success: true });

  const signInUser = async (email, password) => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
    setUser(data.user);
    setIsGuest(false);
    return { success: true, user: data.user };
  };

  const signOutUser = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setIsGuest(true);
    if (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // Supabase password reset: send reset email, then user sets new password via link
  const forgotPassword = async (email) => {
    setError(null);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };
  // Not needed: forgotPasswordSubmit, changePassword (handled via email link)
  const forgotPasswordSubmit = async () => ({ success: false, error: 'Not implemented. Use email link.' });
  const changePassword = async () => ({ success: false, error: 'Not implemented. Use email link.' });

  const getCurrentUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };
  const getUserToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
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
