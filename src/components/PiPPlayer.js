import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePiP } from '../context/PiPContext';

// Mini PiP player: draggable, with preview, close, and return buttons
export default function PiPPlayer({ navigation }) {
  const { pipStream, visible, hidePiP, returnToPlayer } = usePiP();
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // PanResponder for drag
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y },
      ], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        // Snap to bottom-right (optional: add bounds)
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  if (!visible || !pipStream) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
      {...panResponder.panHandlers}
      pointerEvents="box-none"
    >
      <View style={styles.playerBox}>
        {/* Preview image or fallback */}
        <Image
          source={pipStream.thumbnailUrl || pipStream.image}
          style={styles.preview}
          resizeMode="cover"
        />
        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={hidePiP} accessibilityLabel="Close PiP">
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={returnToPlayer} accessibilityLabel="Return to Player">
            <Ionicons name="open-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Title overlay */}
        <Text style={styles.title} numberOfLines={1}>{pipStream.title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    zIndex: 9999,
    elevation: 20,
    pointerEvents: 'box-none',
  },
  playerBox: {
    width: 160,
    height: 90,
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  preview: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.85,
  },
  controls: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  title: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    right: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 2,
  },
});
