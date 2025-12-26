import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn, signUp, forgotPassword } = useAuth();
  const [mode, setMode] = useState('signin'); // signin, signup, forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Apple Sign In handler
  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // You can send credential.identityToken to your backend for verification and user creation/login
      // For now, just show an alert
      Alert.alert('Apple Sign In Success', JSON.stringify(credential));
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        // User cancelled
      } else {
        Alert.alert('Apple Sign In Error', e.message);
      }
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  };

  const handleSignIn = async () => {
    setErrors({});
    if (!email || !validateEmail(email)) {
      setErrors({ email: 'Valid email is required' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.success) {
      // Check if user profile exists in Supabase
      const { data, error } = await require('../lib/supabase').supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', result.user.id)
        .single();
      if (!data || error) {
        // No profile found, go to ProfileSetup
        navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
      } else {
        // Profile exists, go to main app/root
        navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
      }
    } else {
      Alert.alert('Login Failed', result.error || 'Unknown error.');
    }
  };

  const handleSignUp = async () => {
    setErrors({});
    if (!email || !validateEmail(email)) {
      setErrors({ email: 'Valid email is required' });
      return;
    }
    if (!password || !validatePassword(password)) {
      setErrors({ password: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    const result = await signUp(email, null, password);
    // Removed console.log for production
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Account created! Please check your email to verify your account. Once confirmed, log in to continue.');
      setMode('signin');
    } else {
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  const handleConfirmSignUp = async () => {
    setErrors({});
    
    if (!username || !code) {
      setErrors({ code: 'Username and code are required' });
      return;
    }

    setLoading(true);
    const result = await confirmSignUp(username, code);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Email verified! You can now sign in.');
      setMode('signin');
      setCode('');
    } else {
      Alert.alert('Verification Failed', result.error);
    }
  };

  const handleForgotPassword = async () => {
    setErrors({});
    if (!email || !validateEmail(email)) {
      setErrors({ email: 'Valid email is required' });
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
      setMode('signin');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleResetPassword = async () => {
    setErrors({});
    
    if (!username || !code) {
      setErrors({ code: 'Username and code are required' });
      return;
    }
    if (!password || !validatePassword(password)) {
      setErrors({ password: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
      return;
    }

    setLoading(true);
    const result = await forgotPasswordSubmit(username, code, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Password reset successfully! You can now sign in.');
      setMode('signin');
      setCode('');
      setPassword('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleResendCode = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setLoading(true);
    const result = await resendConfirmationCode(username);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Verification code sent!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>BADGER TV</Text>
            <Text style={styles.subtitle}>
              {mode === 'signin' && 'Sign in to continue'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'confirm' && 'Verify your email'}
              {mode === 'forgot' && 'Reset password'}
              {mode === 'reset' && 'Enter new password'}
            </Text>
          </View>

          <View style={styles.form}>
                        {/* Apple Sign In Button (iOS only) */}
                        {Platform.OS === 'ios' && (mode === 'signin' || mode === 'signup') && (
                          <AppleAuthentication.AppleAuthenticationButton
                            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                            cornerRadius={8}
                            style={{ width: '100%', height: 44, marginBottom: 16 }}
                            onPress={handleAppleSignIn}
                          />
                        )}
            {/* Email Field */}
            {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
            )}

            {/* Email Field */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
            )}

            {/* Password Field */}
            {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder={mode === 'reset' ? 'New Password' : 'Password'}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
            )}

            {/* Confirm Password Field */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}



            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => {
                if (mode === 'signin') handleSignIn();
                else if (mode === 'signup') handleSignUp();
                else if (mode === 'forgot') handleForgotPassword();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.BLACK} />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'signin' && 'SIGN IN'}
                  {mode === 'signup' && 'SIGN UP'}
                  {mode === 'confirm' && 'VERIFY'}
                  {mode === 'forgot' && 'SEND CODE'}
                  {mode === 'reset' && 'RESET PASSWORD'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View style={styles.links}>
              {mode === 'signin' && (
                <>
                  <TouchableOpacity onPress={() => setMode('signup')}>
                    <Text style={styles.link}>Create Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMode('forgot')}>
                    <Text style={styles.link}>Forgot Password?</Text>
                  </TouchableOpacity>
                </>
              )}
              {mode === 'signup' && (
                <TouchableOpacity onPress={() => setMode('signin')}>
                  <Text style={styles.link}>Already have an account? Sign In</Text>
                </TouchableOpacity>
              )}
              {mode === 'forgot' && (
                <TouchableOpacity onPress={() => setMode('signin')}>
                  <Text style={styles.link}>Back to Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.WHITE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  links: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  link: {
    color: COLORS.ORANGE,
    fontSize: 14,
    marginVertical: 8,
  },
});

export default LoginScreen;
