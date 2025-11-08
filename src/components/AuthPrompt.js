import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

/**
 * AuthPrompt - Modal that prompts users to sign up/login to access premium features
 * 
 * Usage:
 * <AuthPrompt
 *   visible={showPrompt}
 *   onClose={() => setShowPrompt(false)}
 *   onLogin={() => navigation.navigate('Login')}
 *   feature="save favorites"
 *   benefits={['Save videos across all devices', 'Get personalized recommendations']}
 * />
 */
const AuthPrompt = ({ 
  visible, 
  onClose, 
  onLogin, 
  feature = "access this feature",
  benefits = []
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color={COLORS.ORANGE} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Create a free account</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Sign up to {feature} and unlock more features
          </Text>

          {/* Benefits */}
          {benefits.length > 0 && (
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.ORANGE} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Default benefits if none provided */}
          {benefits.length === 0 && (
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.ORANGE} />
                <Text style={styles.benefitText}>Save favorites across devices</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.ORANGE} />
                <Text style={styles.benefitText}>Continue watching where you left off</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.ORANGE} />
                <Text style={styles.benefitText}>Get notified about new content</Text>
              </View>
            </View>
          )}

          {/* Action buttons */}
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>CREATE FREE ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Maybe Later</Text>
          </TouchableOpacity>

          {/* Free notice */}
          <Text style={styles.freeNotice}>
            💯 100% Free • No credit card required
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.BLACK,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.WHITE,
    marginLeft: 12,
    flex: 1,
  },
  loginButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  freeNotice: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AuthPrompt;
