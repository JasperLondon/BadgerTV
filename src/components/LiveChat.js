import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../config/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function LiveChat({ eventId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch messages and subscribe to new ones
  useEffect(() => {
    let subscription;
    async function fetchMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      if (!error) setMessages(data);
      setLoading(false);
    }
    fetchMessages();
    subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, payload => {
        if (payload.new && payload.new.event_id === eventId) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [eventId]);

  // Send message
  async function sendMessage() {
    if (!input.trim()) return;
    await supabase.from('chat_messages').insert({
      event_id: eventId,
      user_id: user?.id || null,
      username: user?.username || 'Guest',
      message: input.trim(),
    });
    setInput('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Chat</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.msgRow}>
            <Ionicons name="person-circle" size={22} color="#fff" style={{ marginRight: 6 }} />
            <View style={styles.msgBubble}>
              <Text style={styles.msgUser}>{item.username || 'Guest'}</Text>
              <Text style={styles.msgText}>{item.message}</Text>
            </View>
          </View>
        )}
        style={styles.list}
        inverted
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 16,
    padding: 12,
    marginVertical: 18,
    marginHorizontal: 8,
    maxHeight: 340,
  },
  header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
  },
  list: {
    marginBottom: 10,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  msgBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 8,
    maxWidth: '80%',
  },
  msgUser: {
    color: '#ffb347',
    fontWeight: 'bold',
    fontSize: 13,
  },
  msgText: {
    color: '#fff',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#ffb347',
    borderRadius: 8,
    padding: 8,
  },
});
