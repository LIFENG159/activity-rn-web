import React, { useMemo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

// 转盘组件：展示奖品扇区并提供旋转按钮
export default function PrizeWheel({ prizes, spinStyle, onSpin, disabled, lastPrize }) {
  const wheelBackground = useMemo(() => {
    const step = 100 / prizes.length;
    let current = 0;
    const segments = prizes.map((prize) => {
      const start = current;
      const end = current + step;
      current = end;
      return `${prize.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  }, [prizes]);

  return (
    <View>
      <View style={styles.wheelWrap}>
        <Animated.View
          style={[
            styles.wheel,
            {
              backgroundImage: wheelBackground,
            },
            spinStyle,
          ]}
        />
        <View style={styles.wheelCenter}>
          <Text style={styles.wheelCenterText}>SPIN</Text>
        </View>
        <View style={styles.wheelPointer} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Spin wheel"
        onPress={onSpin}
        style={[styles.spinButton, disabled && styles.spinButtonDisabled]}
      >
        <Text style={styles.spinText}>Spin Wheel</Text>
      </Pressable>
      <Text style={styles.prizeNote}>
        {lastPrize ? `Last prize: ${lastPrize.label}` : 'Spin to convert chances into points.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wheelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  wheel: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    borderColor: '#202743',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.35)',
  },
  wheelCenter: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0f1426',
    borderWidth: 2,
    borderColor: '#fef1b4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelCenterText: {
    color: '#fef1b4',
    fontWeight: '700',
    letterSpacing: 1,
  },
  wheelPointer: {
    position: 'absolute',
    top: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fef1b4',
  },
  spinButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: '#ff8a5b',
  },
  spinButtonDisabled: {
    opacity: 0.5,
  },
  spinText: {
    color: '#27150b',
    fontWeight: '700',
    letterSpacing: 1,
  },
  prizeNote: {
    marginTop: 12,
    textAlign: 'center',
    color: '#b4b9d4',
  },
});
