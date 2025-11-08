import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const LoginScreen = () => {
  const { signIn, signUp, confirmSignUp, forgotPassword, forgotPasswordSubmit, resendConfirmationCode } = useAuth();
  
  const [mode, setMode] = useState('signin'); // signin, signup, confirm, forgot, reset
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    
    if (!username) {
      setErrors({ username: 'Username is required' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setLoading(true);
    const result = await signIn(username, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleSignUp = async () => {
    setErrors({});
    
    if (!username) {
      setErrors({ username: 'Username is required' });
      return;
    }
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
    const result = await signUp(username, email, password);
    setLoading(false);

    if (result.success) {
      setMode('confirm');
      Alert.alert('Success', 'Account created! Please check your email for verification code.');
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
    
    if (!username) {
      setErrors({ username: 'Username is required' });
      return;
    }

    setLoading(true);
    const result = await forgotPassword(username);
    setLoading(false);

    if (result.success) {
      setMode('reset');
      Alert.alert('Success', 'Verification code sent to your email.');
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
            {/* Username Field */}
            {(mode === 'signin' || mode === 'signup' || mode === 'confirm' || mode === 'forgot' || mode === 'reset') && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="Username"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
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

            {/* Verification Code Field */}
            {(mode === 'confirm' || mode === 'reset') && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.code && styles.inputError]}
                  placeholder="Verification Code"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => {
                if (mode === 'signin') handleSignIn();
                else if (mode === 'signup') handleSignUp();
                else if (mode === 'confirm') handleConfirmSignUp();
                else if (mode === 'forgot') handleForgotPassword();
                else if (mode === 'reset') handleResetPassword();
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
              
              {mode === 'confirm' && (
                <>
                  <TouchableOpacity onPress={handleResendCode}>
                    <Text style={styles.link}>Resend Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMode('signin')}>
                    <Text style={styles.link}>Back to Sign In</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {(mode === 'forgot' || mode === 'reset') && (
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
