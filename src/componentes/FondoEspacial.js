import React from 'react';
import { StyleSheet, View } from 'react-native';

const STARS = [
  { left: '7%', top: 54, size: 2 },
  { left: '18%', top: 142, size: 3 },
  { left: '34%', top: 78, size: 2 },
  { left: '53%', top: 118, size: 2 },
  { left: '71%', top: 50, size: 3 },
  { left: '89%', top: 158, size: 2 },
  { left: '13%', top: 282, size: 2 },
  { left: '42%', top: 314, size: 3 },
  { left: '64%', top: 253, size: 2 },
  { left: '83%', top: 355, size: 2 },
  { left: '25%', top: 468, size: 2 },
  { left: '55%', top: 506, size: 3 },
  { left: '75%', top: 588, size: 2 },
  { left: '9%', top: 672, size: 3 },
  { left: '38%', top: 746, size: 2 },
  { left: '91%', top: 782, size: 2 },
];

export default function FondoEspacial() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.nebulaAzul} />
      <View style={styles.nebulaVioleta} />
      {STARS.map((star, index) => (
        <View
          key={index}
          style={[
            styles.estrella,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nebulaAzul: {
    position: 'absolute',
    top: -150,
    right: -170,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(18, 123, 194, 0.18)',
  },
  nebulaVioleta: {
    position: 'absolute',
    bottom: -180,
    left: -180,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(102, 54, 160, 0.16)',
  },
  estrella: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: '#B9F5FF',
    opacity: 0.8,
    shadowColor: '#73E8FF',
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
});
