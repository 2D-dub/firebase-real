import React from 'react';
import { StyleSheet, View } from 'react-native';

const ESTRELLAS = [
  [7, 9], [19, 17], [32, 7], [47, 21], [61, 12], [75, 18], [91, 8],
  [12, 34], [27, 42], [39, 31], [54, 46], [69, 37], [84, 48], [96, 34],
  [5, 59], [21, 70], [36, 61], [49, 78], [64, 67], [78, 82], [92, 63],
  [10, 91], [29, 86], [43, 95], [58, 88], [72, 96], [88, 91], [97, 77],
];

export default function FondoEspacial() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.nebulosa, styles.nebulosaAzul]} />
      <View style={[styles.nebulosa, styles.nebulosaVioleta]} />
      {ESTRELLAS.map(([left, top], index) => (
        <View
          key={`${left}-${top}`}
          style={[
            styles.estrella,
            {
              left: `${left}%`,
              top: `${top}%`,
              opacity: index % 4 === 0 ? 0.9 : 0.48,
              width: index % 5 === 0 ? 3 : 2,
              height: index % 5 === 0 ? 3 : 2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nebulosa: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.13,
  },
  nebulosaAzul: {
    top: -150,
    left: -90,
    backgroundColor: '#087BA7',
  },
  nebulosaVioleta: {
    right: -180,
    bottom: -180,
    backgroundColor: '#7150C8',
  },
  estrella: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: '#C4F9FF',
    shadowColor: '#76E5FF',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});
