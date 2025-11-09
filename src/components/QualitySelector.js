import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActionSheetIOS } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// QualitySelector: Overlay button and sheet for quality selection
export function useQualitySelector(defaultQuality = 'Auto') {
  const [quality, setQuality] = useState(defaultQuality);

  // Load last quality from storage on mount
  React.useEffect(() => {
    AsyncStorage.getItem('video_quality').then((q) => {
      if (q) setQuality(q);
    });
  }, []);

  // Save to storage
  const persistQuality = (q) => {
    setQuality(q);
    AsyncStorage.setItem('video_quality', q);
  };

  // Show quality sheet
  const showQualitySheet = () => {
    const options = ['Auto', '1080p', '720p', '480p', 'Cancel'];
    const cancelButtonIndex = 4;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Select Quality',
        },
        (buttonIndex) => {
          if (buttonIndex < cancelButtonIndex) {
            persistQuality(options[buttonIndex]);
          }
        }
      );
    } else {
      // Simple fallback for Android: prompt
      // (Replace with a better ActionSheet if desired)
      // eslint-disable-next-line no-alert
      const q = prompt('Quality: Auto, 1080p, 720p, 480p', quality);
      if (q && options.includes(q)) persistQuality(q);
    }
  };

  return { quality, setQuality: persistQuality, showQualitySheet };
}

// Overlay button for player UI
export function QualityButton({ onPress, quality }) {
  return (
    <TouchableOpacity style={styles.qualityBtn} onPress={onPress} accessibilityLabel="Select Quality">
      <Ionicons name="options-outline" size={20} color="#fff" style={{ marginRight: 4 }} />
      <Text style={styles.qualityText}>Quality: {quality}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  qualityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-end',
    marginRight: 8,
    marginTop: 8,
  },
  qualityText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
