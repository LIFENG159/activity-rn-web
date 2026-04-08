const buildUrl = (baseUrl, path) => {
  const base = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

export async function getJson({ baseUrl, path, params, signal }) {
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
