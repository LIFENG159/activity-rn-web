import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// 任务卡片：展示任务标题、描述与操作按钮
export default function TaskCard({
  title,
  meta,
  actionLabel,
  actionContent,
  onAction,
  disabled,
  actionTestId,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onAction}
        style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
        testID={actionTestId}
      >
        {actionContent || <Text style={styles.actionText}>{actionLabel}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 36, 58, 0.9)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 109, 148, 0.35)',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f7ff',
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: '#b4b9d4',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#4f5cff',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    color: '#f7f8ff',
    fontWeight: '600',
  },
});
