import type { HomeFeatured, HomeUpdate } from "@/lib/mock-data";

export type HomeFeedResponse = {
  categories: string[];
  featured: HomeFeatured;
  updates: HomeUpdate[];
};

export async function fetchHomeFeed(): Promise<HomeFeedResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
      : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}/api/home`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch home feed.");
  }

  return (await response.json()) as HomeFeedResponse;
}
