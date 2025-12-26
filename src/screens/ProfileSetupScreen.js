import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { COLORS } from '../constants/colors';

export default function ProfileSetupScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState(''); // Format: YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!name || !birthday) {
      Alert.alert('Error', 'Please enter your name and birthday.');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, name, birthday });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile saved!');
      navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Birthday (YYYY-MM-DD)"
        value={birthday}
        onChangeText={setBirthday}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveProfile} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    color: COLORS.ORANGE,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.WHITE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
    width: '100%',
    maxWidth: 320,
  },
  button: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    maxWidth: 320,
  },
  buttonText: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
