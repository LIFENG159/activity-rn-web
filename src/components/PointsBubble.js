import React from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

export default function PointsBubble({ value, onClaim, style }) {
  return (
    <Animated.View style={[styles.bubble, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="claim bubble"
        onPress={onClaim}
        testID="points-bubble"
        style={styles.bubblePress}
      >
        <Text style={styles.bubbleTitle}>Claim</Text>
        <Text style={styles.bubbleValue}>+{value}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    right: 18,
    top: -20,
    borderRadius: 999,
    backgroundColor: '#ffec99',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.2)',
  },
  bubblePress: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bubbleTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6a4b00',
  },
  bubbleValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5a3900',
  },
});
