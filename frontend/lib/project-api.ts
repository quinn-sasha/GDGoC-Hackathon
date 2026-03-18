import { apiUrl, buildAuthHeaders } from "@/lib/api";

export async function fetchProjectDetail(projectId: string) {
  const response = await fetch(apiUrl(`/api/projects/${projectId}/`), {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("プロジェクト詳細の取得に失敗しました");
  return response.json();
}

export async function createProject(data: {
  title: string;
  description: string;
  technologies?: string[];
  categories?: string[];
  progress_status?: string;
}) {
  const response = await fetch(apiUrl("/api/projects/"), {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      typeof error === "object" ? JSON.stringify(error) : "プロジェクトの作成に失敗しました",
    );
  }
  return response.json();
}

export async function toggleSaveProject(projectId: string) {
  const response = await fetch(apiUrl(`/api/projects/${projectId}/toggle_save/`), {
    method: "POST",
    headers: buildAuthHeaders(),
  });
  if (!response.ok) throw new Error("保存状態の変更に失敗しました");
  return response.json();
}

export async function joinProject({ projectId }: { projectId: string }) {
  return toggleSaveProject(projectId);
}
