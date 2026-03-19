const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8000";

// JWTペイロードから自分のuser_idを取得
export function getMyUserId(): number | null {
  if (typeof window === "undefined") return null;
  const token =
    sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.user_id === "number" ? payload.user_id : null;
  } catch {
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
      : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export type ConversationOtherUser = {
  id: number;
  username: string;
  icon_image_path: string;
};

export type ConversationLastMessage = {
  id: string;
  sender_username: string;
  content: string;
  created_at: string;
};

export type Conversation = {
  id: string; // UUID
  room_type: "PERSONAL_CHAT" | "PROJECT_CHAT";
  project_id: string | null;
  other_user: ConversationOtherUser | null;
  last_message: ConversationLastMessage | null;
  unread_count: number;
  updated_at: string;
};

export type PaginatedConversations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversation[];
};

export type ChatMessage = {
  id: string; // UUID
  sender: {
    id: number;
    username: string;
    icon_image_path: string;
  };
  content: string;
  created_at: string;
};

export type PaginatedMessages = {
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
};

// 会話一覧取得
export async function fetchConversations(): Promise<PaginatedConversations> {
  const res = await fetch(`${BASE}/api/conversations/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("チャット一覧の取得に失敗しました");
  return res.json();
}

// メッセージ一覧取得
export async function fetchMessages(conversationId: string): Promise<PaginatedMessages> {
  const res = await fetch(`${BASE}/api/conversations/${conversationId}/messages/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("メッセージの取得に失敗しました");
  return res.json();
}

// メッセージ送信
export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  const res = await fetch(`${BASE}/api/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("メッセージの送信に失敗しました");
  return res.json();
}

// 既読マーク
export async function markRead(conversationId: string): Promise<void> {
  await fetch(`${BASE}/api/conversations/${conversationId}/mark-read/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

// 会話一覧から特定IDの会話を検索（retrieve APIが存在しないため）
export async function fetchConversationById(id: string): Promise<Conversation | null> {
  const data = await fetchConversations();
  return data.results.find((c) => c.id === id) ?? null;
}

// 個人チャットを作成（既存の場合はそれを返す）
export async function createConversation(userId: number): Promise<Conversation> {
  const res = await fetch(`${BASE}/api/conversations/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("チャットの作成に失敗しました");
  return res.json();
}
