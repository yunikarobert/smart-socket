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
    width: 60,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#444',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 2,
    borderColor: '#222',
    marginBottom: 30,
  },
  toggleOn: {
    backgroundColor: '#00ff99',
    borderColor: '#00cc77',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  circleOn: {
    backgroundColor: '#222',
    transform: [{ translateX: 26 }],
  },
});
