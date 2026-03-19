import type { ChatThread } from "@/lib/mock-data";

export async function fetchChatThreads(): Promise<ChatThread[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";
  const response = await fetch(`${baseUrl}/api/chat/threads/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("チャットスレッドの取得に失敗しました");
  }
  return response.json();
}

// 他にもfetchChatMessages, postChatMessageなどAPI設計に応じて追加予定