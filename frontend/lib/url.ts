export function buildUrl(path: string, params?: Record<string, unknown>) {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((item) => sp.append(k, String(item)));
      } else {
        sp.set(k, String(v));
      }
    });
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}
