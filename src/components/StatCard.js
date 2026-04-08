import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StatCard({ label, value, testID }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text testID={testID} style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 140,
    flexGrow: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(35, 41, 64, 0.7)',
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9aa3c7',
  },
  value: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '700',
    color: '#fef1b4',
  },
});
