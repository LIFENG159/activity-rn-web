// 统一构建请求 URL
const buildUrl = (baseUrl, path) => {
  const base = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

export async function getJson({ baseUrl, path, params, signal }) {
  // GET 请求封装，返回 { ok, data }
  const url = new URL(buildUrl(baseUrl, path));
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    return { ok: false, data: null };
  }
  const data = await response.json();
  return { ok: true, data };
}

export async function postJson({ baseUrl, path, body, signal }) {
  // POST 请求封装，返回 { ok, data }
  const response = await fetch(buildUrl(baseUrl, path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!response.ok) {
    return { ok: false, data: null };
  }
  const data = await response.json();
  return { ok: true, data };
}
