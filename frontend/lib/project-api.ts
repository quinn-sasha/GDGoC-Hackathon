// プロジェクト詳細・一覧・作成・応募APIクライアント

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

function getAuthToken(): string | null {
  return typeof window !== "undefined"
    ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
    : null;
}

export async function fetchProjects() {
  const response = await fetch(`${baseUrl}/api/projects/`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("プロジェクト一覧の取得に失敗しました");
  return await response.json();
}

export async function fetchProjectDetail(projectId: string) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("プロジェクト詳細の取得に失敗しました");
  return await response.json();
}

export async function createProject(data: {
  title: string;
  description: string;
  progress_status: string;
  technologies?: string[];
}) {
  const response = await fetch(`${baseUrl}/api/projects/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("ログインが必要です。再度ログインしてください。");
    let detail = "プロジェクトの作成に失敗しました";
    try {
      const err = await response.json();
      if (err.detail) detail = String(err.detail);
      else if (err.technologies) detail = `スキルエラー: ${JSON.stringify(err.technologies)}`;
      else if (err.title) detail = `タイトルエラー: ${JSON.stringify(err.title)}`;
      else detail = JSON.stringify(err);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return await response.json();
}

export async function uploadProjectImage(projectId: string, file: File): Promise<string> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/upload-image/`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) {
    let detail = "画像のアップロードに失敗しました";
    try {
      const err = await response.json();
      if (err.detail) detail = String(err.detail);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  const data = await response.json();
  return data.project_image_path as string;
}

export type ProjectApplication = {
  id: string;
  applicant_id: number;
  applicant_name: string;
  applicant_icon: string;
  role: string;
  availability: string;
  message: string;
  portfolio_url: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

export async function fetchProjectApplications(projectId: string): Promise<ProjectApplication[]> {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/applications/`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("応募者一覧の取得に失敗しました");
  return await response.json();
}

export async function submitProjectApplication({
  projectId,
  role,
  availability,
  message,
  portfolioUrl,
}: {
  projectId: string;
  role: string;
  availability: string;
  message: string;
  portfolioUrl?: string;
}) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/apply/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role, availability, message, portfolio_url: portfolioUrl }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("ログインが必要です。再度ログインしてください。");
    let detail = "応募の送信に失敗しました";
    try {
      const err = await response.json();
      if (err.detail) detail = String(err.detail);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return await response.json();
}
