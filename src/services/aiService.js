import { getJson, postJson } from './requestClient';

// AI 接口：发送问题并获取回答
export async function sendAiMessage({ baseUrl, userId, conversationId, message, signal }) {
  // 统一通过后端 AI 接口发送消息
  const result = await postJson({
    baseUrl,
    path: '/api/ai/chat',
    body: { userId, conversationId, message },
    signal,
  });
  if (!result.ok) {
    return null;
  }
  return result.data?.data || null;
}

// AI 接口：获取指定会话的消息列表
export async function fetchAiMessages({ baseUrl, conversationId, signal }) {
  const result = await getJson({
    baseUrl,
    path: `/api/ai/messages/${conversationId}`,
    signal,
  });
  if (!result.ok) {
    return [];
  }
  return Array.isArray(result.data?.data) ? result.data.data : [];
}
