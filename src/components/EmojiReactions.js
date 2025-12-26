import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { supabase } from '../config/supabase';

const EMOJIS = ['👍', '🔥', '😂', '👏', '😍'];

export default function EmojiReactions({ eventId, user }) {
  const [counts, setCounts] = useState({});
  const [sending, setSending] = useState(false);

  // Fetch emoji counts and subscribe to changes
  useEffect(() => {
    let subscription;
    async function fetchCounts() {
      const { data, error } = await supabase
        .from('emoji_reactions')
        .select('emoji, count:emoji')
        .eq('event_id', eventId);
      if (!error && data) {
        const tally = {};
        data.forEach(row => {
          tally[row.emoji] = (tally[row.emoji] || 0) + 1;
        });
        setCounts(tally);
      }
    }
    fetchCounts();
    subscription = supabase
      .channel('emoji_reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emoji_reactions' }, payload => {
        if (payload.new && payload.new.event_id === eventId) {
          setCounts(prev => ({
            ...prev,
            [payload.new.emoji]: (prev[payload.new.emoji] || 0) + 1,
          }));
        }
      })
      .subscribe();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [eventId]);

  // Send emoji reaction
  async function sendEmoji(emoji) {
    setSending(true);
    await supabase.from('emoji_reactions').insert({
      event_id: eventId,
      user_id: user?.id || null,
      emoji,
    });
    setSending(false);
  }

  return (
    <View style={styles.bar}>
      {EMOJIS.map(e => (
        <TouchableOpacity
          key={e}
          style={styles.emojiBtn}
          onPress={() => sendEmoji(e)}
          disabled={sending}
        >
          <Text style={styles.emoji}>{e}</Text>
          <Text style={styles.count}>{counts[e] || 0}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 16,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 8,
  },
  emojiBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  count: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
