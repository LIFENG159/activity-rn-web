import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// AI 对话组件：展示消息列表与输入框
export default function AiChatWidget({ messages, onSend, isSending }) {
  const [input, setInput] = useState('');

  const trimmed = useMemo(() => input.trim(), [input]);

  // 发送消息（按钮或回车触发）
  const handleSend = () => {
    if (!trimmed || isSending) {
      return;
    }
    onSend(trimmed);
    setInput('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI 助手</Text>
      <View style={styles.messages}>
        {messages.length === 0 ? (
          <Text style={styles.placeholder}>可以询问活动规则或任务问题。</Text>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.bubble,
                message.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.bubbleText}>{message.content}</Text>
            </View>
          ))
        )}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit
          placeholder="请输入问题..."
          placeholderTextColor="#7a819a"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          onPress={handleSend}
          style={[styles.sendButton, (!trimmed || isSending) && styles.sendDisabled]}
        >
          <Text style={styles.sendText}>{isSending ? '...' : '发送'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 24, 40, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(99, 109, 148, 0.25)',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f7ff',
  },
  messages: {
    gap: 8,
  },
  placeholder: {
    color: '#9aa3c7',
    fontSize: 13,
  },
  bubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: '90%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f5cff',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(35, 41, 64, 0.9)',
  },
  bubbleText: {
    color: '#f7f8ff',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(11, 15, 28, 0.9)',
    color: '#f7f8ff',
    borderWidth: 1,
    borderColor: 'rgba(99, 109, 148, 0.25)',
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#ff8a5b',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#27150b',
    fontWeight: '600',
  },
});
