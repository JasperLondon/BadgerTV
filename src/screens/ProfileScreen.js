import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useVideos } from '../context/VideoContext';
import { COLORS } from '../constants/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, isGuest, signOut, changePassword } = useAuth();
  const { getWatchHistory, getFavorites } = useVideos();
  
  const [watchHistory, setWatchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [history, favs] = await Promise.all([
        getWatchHistory(),
        getFavorites(),
      ]);
      setWatchHistory(history);
      setFavorites(favs);
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    const { data, error } = await require('../lib/supabase').supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();
    if (data && !error) {
      setProfile(data);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your current password',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (currentPassword) => {
            if (!currentPassword) return;
            Alert.prompt(
              'Change Password',
              'Enter your new password',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Change',
                  onPress: async (newPassword) => {
                    if (!newPassword || newPassword.length < 8) {
                      Alert.alert('Error', 'Password must be at least 8 characters');
                      return;
                    }
                    const result = await changePassword(currentPassword, newPassword);
                    if (result.success) {
                      Alert.alert('Success', 'Password changed successfully');
                    } else {
                      Alert.alert('Error', result.error);
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ],
      'secure-text'
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.ORANGE} />
      </View>
    );
  }

  // Guest View - Show benefits of signing up
  if (isGuest || !isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.guestContainer}>
          {/* Logo/Icon */}
          <View style={styles.guestIconContainer}>
            <Image 
              source={require('../../assets/mwd-logo.png')} 
              style={styles.guestLogo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.guestTitle}>Welcome to Badger TV!</Text>
          <Text style={styles.guestSubtitle}>
            You're browsing as a guest. Create a free account to unlock these features:
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="heart" size={24} color={COLORS.ORANGE} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Save Favorites</Text>
                <Text style={styles.benefitDescription}>
                  Save your favorite videos and access them on any device
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="time" size={24} color={COLORS.ORANGE} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Continue Watching</Text>
                <Text style={styles.benefitDescription}>
                  Pick up right where you left off, on any device
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="notifications" size={24} color={COLORS.ORANGE} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Get Notified</Text>
                <Text style={styles.benefitDescription}>
                  Be the first to know about SkyFall events and new content
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="lock-open" size={24} color={COLORS.ORANGE} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Exclusive Access</Text>
                <Text style={styles.benefitDescription}>
                  Unlock behind-the-scenes content and full episodes
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="gift" size={24} color={COLORS.ORANGE} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Merch & Giveaways</Text>
                <Text style={styles.benefitDescription}>
                  Get exclusive access to merch drops and contests
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => navigation.navigate('Login', { mode: 'signup' })}
          >
            <Text style={styles.signUpButtonText}>CREATE FREE ACCOUNT</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.signUpButton, { backgroundColor: COLORS.SURFACE, borderWidth: 1, borderColor: COLORS.ORANGE, marginBottom: 8 }]}
            onPress={() => navigation.navigate('Login', { mode: 'signin' })}
          >
            <Text style={[styles.signUpButtonText, { color: COLORS.ORANGE }]}>LOG IN</Text>
          </TouchableOpacity>

          <Text style={styles.freeNotice}>
            💯 100% Free • No credit card • No spam
          </Text>

          <Text style={styles.continueAsGuest}>
            You can continue browsing and watching videos as a guest
          </Text>
        </ScrollView>
      </View>
    );
  }

  // Authenticated User View
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.profileCardEnhanced}>
            <View style={styles.avatarContainerEnhanced}>
              <Image 
                source={require('../../assets/mwd-logo.png')} 
                style={styles.avatarEnhanced}
                resizeMode="cover"
              />
            </View>
            <View style={styles.profileInfoEnhanced}>
              <Text style={styles.usernameEnhanced}>{profile?.name ? `Hi, ${profile.name}!` : 'Hi, User!'}</Text>
              <Text style={styles.emailEnhanced}>{user?.email || user?.attributes?.email || ''}</Text>
              <Text style={styles.welcomeEnhanced}>Welcome to Badger TV!</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{watchHistory.length}</Text>
            <Text style={styles.statLabel}>Watched</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <Ionicons name="lock-closed-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Content</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('WatchHistory')}
          >
            <Ionicons name="time-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>Watch History</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="heart-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>My Favorites</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Downloads')}>
            <Ionicons name="download-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>Downloads</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HelpSupport')}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {
            const url = 'https://www.mywickeddude.com/privacy-policy';
            if (typeof Linking !== 'undefined') {
              Linking.openURL(url);
            }
          }}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.menuItemText}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.WHITE} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  profileCardEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarContainerEnhanced: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: COLORS.ORANGE,
    marginRight: 20,
  },
    avatarEnhanced: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    profileInfoEnhanced: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    usernameEnhanced: {
      fontSize: 26,
      fontWeight: 'bold',
      color: COLORS.ORANGE,
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    emailEnhanced: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.85)',
      marginBottom: 4,
    },
    welcomeEnhanced: {
      fontSize: 16,
      color: COLORS.WHITE,
      fontWeight: '500',
    },
  avatarContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.WHITE,
    marginLeft: 16,
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,68,68,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.5)',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginLeft: 12,
  },
  // Guest Mode Styles
  guestContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  guestIconContainer: {
    marginBottom: 24,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestLogo: {
    width: 120,
    height: 120,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 12,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  benefitTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: COLORS.ORANGE,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    letterSpacing: 1,
  },
  freeNotice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueAsGuest: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProfileScreen;
