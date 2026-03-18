import type { ChatThread } from "@/lib/mock-data";

export type Conversation = {
  id: string;
  type: "PERSONAL_CHAT" | "PROJECT_CHAT";
  users: Array<{ id: number; username: string; avatar: string }>;
  last_message: {
    id: string;
    sender: { id: number; username: string };
    content: string;
    created_at: string;
  } | null;
  unread_count: number;
};

export type Message = {
  id: string;
  sender: { id: number; username: string };
  content: string;
  created_at: string;
};

export async function fetchConversations(page = 1): Promise<{ results: Conversation[]; next: string | null }> {
  const res = await fetch(`/api/conversations/?page=${page}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("会話一覧の取得に失敗しました");
  return res.json();
}

export async function createPersonalChat(userId: number): Promise<Conversation> {
  const res = await fetch(`/api/conversations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user: userId }),
  });
  if (!res.ok) throw new Error("チャット作成に失敗しました");
  return res.json();
}

export async function fetchMessages(conversationId: string, cursor?: string): Promise<{ results: Message[]; next: string | null }> {
  let url = `/api/conversations/${conversationId}/messages/`;
  if (cursor) url += `?cursor=${encodeURIComponent(cursor)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("メッセージ取得に失敗しました");
  return res.json();
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  const res = await fetch(`/api/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("メッセージ送信に失敗しました");
  return res.json();
}

export async function markAsRead(conversationId: string, messageId: string): Promise<void> {
  const res = await fetch(`/api/conversations/${conversationId}/mark-read/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ last_read_message: messageId }),
  });
  if (!res.ok) throw new Error("既読マークに失敗しました");
}
