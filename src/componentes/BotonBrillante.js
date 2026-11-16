import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { CURSOR_AZUL } from './tema';

export default function BotonBrillante({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  compact = false,
  accessibilityLabel,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        variant === 'secondary' && styles.secondary,
        hovered && !disabled && styles.hovered,
        pressed && styles.pressed,
        disabled && styles.disabled,
        Platform.OS === 'web' && { cursor: CURSOR_AZUL },
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#75E9FF',
    backgroundColor: '#087BA7',
    shadowColor: '#48DFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  compact: {
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 11,
  },
  secondary: {
    backgroundColor: 'rgba(11, 26, 55, 0.88)',
    borderColor: '#456A9E',
    shadowOpacity: 0.12,
  },
  hovered: {
    backgroundColor: '#109CC8',
    borderColor: '#C4F9FF',
    shadowOpacity: 0.9,
    shadowRadius: 17,
    elevation: 9,
    transform: [{ translateY: -1 }],
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.48,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    color: '#F3FCFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryLabel: {
    color: '#BCEFFF',
  },
});
