import { apiUrl, buildAuthHeaders } from "@/lib/api";

export type ProfileData = {
  id: number;
  username: string;
  email: string;
  profile_bio: string | null;
  github_url: string | null;
  icon_image_path: string | null;
  skills: { id: number; name: string }[];
  created_at: string;
  updated_at: string;
};

export async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch(apiUrl("/api/profile/me/"), {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("プロフィール取得に失敗しました");
  return res.json();
}

export async function updateProfile(data: Partial<ProfileData & { skill_ids?: number[] }>) {
  const res = await fetch(apiUrl("/api/profile/me/"), {
    method: "PATCH",
    headers: buildAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("プロフィール更新に失敗しました");
  return res.json();
}
