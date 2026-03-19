// プロジェクト詳細・応募・参加APIクライアント

const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
      : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchProjectDetail(projectId: number) {
  const response = await fetch(`${baseUrl}/api/project/${projectId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("プロジェクト詳細の取得に失敗しました");
  }
  return await response.json();
}

export async function submitProjectApplication({
  projectId,
  role,
  availability,
  message,
  portfolioUrl,
}: {
  projectId: number;
  role: string;
  availability: string;
  message: string;
  portfolioUrl?: string;
}) {
  const response = await fetch(`${baseUrl}/api/project/${projectId}/apply`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role, availability, message, portfolioUrl }),
  });
  if (!response.ok) {
    throw new Error("応募の送信に失敗しました");
  }
  return await response.json();
}

export async function joinProject({
  projectId,
}: {
  projectId: number;
}) {
  const response = await fetch(`${baseUrl}/api/project/${projectId}/join`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("プロジェクト参加に失敗しました");
  }
  return await response.json();
}
