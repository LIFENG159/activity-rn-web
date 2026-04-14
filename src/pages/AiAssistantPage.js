import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AiChatWidget from '../components/AiChatWidget';
import { sendAiMessage } from '../services/aiService';

export default function AiAssistantPage() {
  const [aiMessages, setAiMessages] = useState([]);
  const [aiConversationId, setAiConversationId] = useState('');
  const [aiSending, setAiSending] = useState(false);

  // 发送用户消息并请求后端 AI
  const handleAiSend = async (text) => {
    const baseUrl = process.env.REACT_APP_TASK_API_BASE;
    if (!baseUrl || aiSending) {
      return;
    }
    // 先把用户消息展示到列表里
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiSending(true);
    const result = await sendAiMessage({
      baseUrl,
      userId: 'user-demo',
      conversationId: aiConversationId,
      message: text,
    });
    if (result) {
      // 收到 AI 回复后追加到消息列表
      const answer = result.answer || '';
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: answer,
      };
      setAiMessages((prev) => [...prev, assistantMessage]);
      // 记录会话 id，后续请求可复用上下文
      if (result.conversationId) {
        setAiConversationId(result.conversationId);
      }
    }
    setAiSending(false);
  };

  return (
    <View style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Assistant</Text>
        <Text style={styles.subtitle}>Chat with the activity helper.</Text>
      </View>
      <AiChatWidget messages={aiMessages} onSend={handleAiSend} isSending={aiSending} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    minHeight: '100vh',
    padding: 24,
    backgroundColor: '#0b0f1c',
    backgroundImage:
      'radial-gradient(circle at top, rgba(79, 92, 255, 0.25), transparent 55%), radial-gradient(circle at 20% 20%, rgba(246, 211, 101, 0.18), transparent 45%)',
    color: '#f5f7ff',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f7ff',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#b4b9d4',
  },
});
