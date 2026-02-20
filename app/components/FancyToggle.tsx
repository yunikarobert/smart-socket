import React from 'react';
import { Pressable, Animated, StyleSheet, View } from 'react-native';

interface FancyToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export default function FancyToggle({ isOn, onToggle }: FancyToggleProps) {
  return (
    <Pressable onPress={onToggle} style={[styles.toggle, isOn && styles.toggleOn]}>
      <Animated.View style={[styles.circle, isOn && styles.circleOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 140,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: '#555',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  toggleOn: {
    backgroundColor: '#1a1a1a',
    borderColor: '#00ff99',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 3 },
  },
  circleOn: {
    backgroundColor: '#00ff99',
    transform: [{ translateX: 60 }],
  },
});
