import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, LayoutAnimation, Platform, UIManager, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const openLink = url => Linking.openURL(url);

const FAQ_DATA = [
  {
    title: 'Account & Login',
    icon: 'person-circle-outline',
    items: [
      {
        q: 'I can’t log in.',
        a: 'Make sure you’re using the same email or sign-in method (Apple, Google, or Email) you originally used. If you forgot your password, tap “Forgot Password” to reset it.'
      },
      {
        q: 'How do I sign up?',
        a: 'On the home screen, tap “Sign Up” and choose Apple, Google, or Email login.'
      }
    ]
  },
  {
    title: 'Video Playback',
    icon: 'play-circle-outline',
    items: [
      {
        q: 'Videos are buffering or not loading.',
        a: 'Check your connection. Badger TV requires a stable network—Wi-Fi or strong 4G/5G. Try closing and reopening the app if the issue persists.'
      },
      {
        q: 'Why does video quality change?',
        a: 'Badger TV uses adaptive streaming through AWS CloudFront, which adjusts video quality based on your connection speed.'
      }
    ]
  },
  {
    title: 'Notifications',
    icon: 'notifications-outline',
    items: [
      {
        q: 'I’m not receiving notifications.',
        a: 'Make sure notifications are enabled in your device settings under Settings → Badger TV → Notifications.'
      }
    ]
  },
  {
    title: 'Device Support',
    icon: 'phone-portrait-outline',
    items: [
      {
        q: 'What devices does Badger TV support?',
        a: 'iOS 14+ and Android 11+. For the best experience, keep both your system and app updated.'
      }
    ]
  }
];

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CollapsibleFAQ = ({ data }) => {
  const [open, setOpen] = useState(null);
  const toggle = idx => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === idx ? null : idx);
  };
  return data.map((section, idx) => (
    <Card key={section.title} style={{ marginBottom: 16 }}>
      <TouchableOpacity style={styles.faqHeader} onPress={() => toggle(idx)}>
        <Ionicons name={section.icon} size={22} color={COLORS.ORANGE} style={{ marginRight: 8 }} />
        <Text style={styles.faqTitle}>{section.title}</Text>
        <Ionicons name={open === idx ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.ORANGE} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
      {open === idx && section.items.map((item, i) => (
        <View key={i} style={styles.faqItem}>
          <Text style={styles.faqQ}>{item.q}</Text>
          <Text style={styles.faqA}>{item.a}</Text>
        </View>
      ))}
    </Card>
  ));
};

const HelpSupportScreen = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#181818' }}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.header}>BADGER TV</Text>
    <Text style={styles.subHeader}>Help & Support</Text>

    <CollapsibleFAQ data={FAQ_DATA} />

    <Card>
      <Text style={styles.sectionTitle}>Contact Support</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.ORANGE }]} onPress={() => openLink('mailto:badgertv@mywickeddude.com')}>
        <Ionicons name="mail-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Email: badgertv@mywickeddude.com</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Average response time: 24–48 hours.</Text>
    </Card>

    <Card>
      <Text style={styles.sectionTitle}>App Info Sent with Support Requests</Text>
      <Text style={styles.text}>• App version
• Device model
• Operating system version
• Network type (Wi-Fi / Cellular)</Text>
      <Text style={styles.text}>This helps our team troubleshoot issues faster.</Text>
    </Card>

    <Card>
      <Text style={styles.sectionTitle}>Useful Links</Text>
      <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.mywickeddude.com/privacy-policy')}>
        <Ionicons name="document-text-outline" size={18} color={COLORS.ORANGE} />
        <Text style={styles.linkButtonText}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.mywickeddude.com/terms-conditions')}>
        <Ionicons name="document-text-outline" size={18} color={COLORS.ORANGE} />
        <Text style={styles.linkButtonText}>Terms and Conditions</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.mywickeddude.com/badger-guarantee')}>
        <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.ORANGE} />
        <Text style={styles.linkButtonText}>Badger Guarantee</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => openLink('https://www.mywickeddude.com')}>
        <Ionicons name="globe-outline" size={18} color={COLORS.ORANGE} />
        <Text style={styles.linkButtonText}>My Wicked Dude Website</Text>
      </TouchableOpacity>
    </Card>

    <Card>
      <Text style={styles.sectionTitle}>Send Feedback</Text>
      <Text style={styles.text}>We welcome your input to improve Badger TV. Use Help & Support → Send Feedback to:
• Report bugs or playback issues
• Suggest new features
• Share general feedback
Attach screenshots (optional)
This goes directly to the Badger TV support team at badgertv@mywickeddude.com.</Text>
    </Card>
    <View style={{ height: 32 }} />
    </ScrollView>
  </SafeAreaView>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  subHeader: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 2,
    letterSpacing: 1.1,
  },
  card: {
    backgroundColor: '#232323',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  faqItem: {
    marginTop: 10,
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#ff9800',
    paddingLeft: 10,
    marginBottom: 8,
  },
  faqQ: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  faqA: {
    color: '#ccc',
    marginBottom: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  linkButtonText: {
    color: COLORS.ORANGE,
    marginLeft: 7,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  text: {
    color: '#ccc',
    marginBottom: 6,
    fontSize: 14,
  },
});

export default HelpSupportScreen;
