import type { HomeFeatured, HomeUpdate } from "@/lib/mock-data";

export type HomeFeedResponse = {
  categories: string[];
  featured: HomeFeatured;
  updates: HomeUpdate[];
};

export async function fetchHomeFeed(): Promise<HomeFeedResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  const response = await fetch(`${baseUrl}/api/home`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch home feed.");
  }

  return (await response.json()) as HomeFeedResponse;
}
