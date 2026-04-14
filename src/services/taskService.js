import { getJson } from './requestClient';

// 任务接口：获取任务列表
export async function fetchTasks({ baseUrl, activityId, userId, signal }) {
  if (!baseUrl) {
    return [];
  }

  try {
    const result = await getJson({
      baseUrl,
      path: '/api/tasks',
      params: { activityId, userId },
      signal,
    });
    if (!result.ok) {
      return [];
    }
    const data = result.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.tasks)) {
      return data.tasks;
    }
    return [];
  } catch (error) {
    return [];
  }
}
