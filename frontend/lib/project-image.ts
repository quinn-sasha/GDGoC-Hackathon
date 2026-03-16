export function buildProjectImage(title: string, category: string) {
  const palette: Record<string, { start: string; end: string }> = {
    技術: { start: "#0f766e", end: "#164e63" },
    デザイン: { start: "#9333ea", end: "#4c1d95" },
    アート: { start: "#db2777", end: "#831843" },
    音楽: { start: "#ea580c", end: "#7c2d12" },
    映像: { start: "#2563eb", end: "#1e3a8a" },
  };

  const colors = palette[category] ?? { start: "#334155", end: "#0f172a" };
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors.start}" />
          <stop offset="100%" stop-color="${colors.end}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="720" fill="url(#bg)" rx="40" />
      <circle cx="1000" cy="120" r="180" fill="rgba(255,255,255,0.12)" />
      <circle cx="180" cy="620" r="220" fill="rgba(255,255,255,0.08)" />
      <text x="72" y="120" fill="rgba(255,255,255,0.72)" font-size="34" font-family="Segoe UI, sans-serif">${category}</text>
      <text x="72" y="620" fill="#ffffff" font-size="58" font-weight="700" font-family="Segoe UI, sans-serif">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
