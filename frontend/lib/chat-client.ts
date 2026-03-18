import { apiUrl, buildAuthHeaders } from "@/lib/api";

// --- バックエンドAPIの型 ---

export type ApiConversation = {
  id: string;
  room_type: "PROJECT_CHAT" | "PERSONAL_CHAT";
  project_id: string | null;
  other_user: {
    id: number;
    username: string;
    icon_image_path: string | null;
  } | null;
  last_message: {
    id: number;
    sender_username: string;
    content: string;
    created_at: string;
  } | null;
  unread_count: number;
  updated_at: string;
};

export type ApiMessage = {
  id: number;
  sender: {
    id: number;
    username: string;
    icon_image_path: string | null;
  };
  content: string;
  created_at: string;
};

type ConversationListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiConversation[];
};

type MessageListResponse = {
  next: string | null;
  previous: string | null;
  results: ApiMessage[];
};

// --- UI向けスレッド型 ---

export type UiThread = {
  id: string;
  title: string;
  project: string;
  role: string;
  preview: string;
  unreadCount: number;
  online: boolean;
  pinned: boolean;
  avatar: string;
  time: string;
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "今";
  if (diffMins < 60) return `${diffMins}分前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  return `${Math.floor(diffHours / 24)}日前`;
}

function toUiThread(conv: ApiConversation): UiThread {
  const title =
    conv.other_user?.username ?? `チャット ${conv.id.slice(0, 8)}`;
  return {
    id: conv.id,
    title,
    project:
      conv.project_id
        ? `プロジェクト ${conv.project_id.slice(0, 8)}`
        : "ダイレクトメッセージ",
    role: "",
    preview: conv.last_message?.content ?? "",
    unreadCount: conv.unread_count,
    online: false,
    pinned: false,
    avatar: (title[0] ?? "?").toUpperCase(),
    time: conv.updated_at ? formatTime(conv.updated_at) : "",
  };
}

// --- API呼び出し ---

export async function fetchConversations(): Promise<UiThread[]> {
  const response = await fetch(apiUrl("/api/conversations/"), {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("会話一覧の取得に失敗しました");
  const data: ConversationListResponse = await response.json();
  return data.results.map(toUiThread);
}

export async function fetchConversationDetail(id: string): Promise<ApiConversation> {
  const response = await fetch(apiUrl(`/api/conversations/${id}/`), {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("会話の取得に失敗しました");
  return response.json();
}

export async function fetchMessages(conversationId: string): Promise<ApiMessage[]> {
  const response = await fetch(
    apiUrl(`/api/conversations/${conversationId}/messages/`),
    {
      headers: buildAuthHeaders(),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("メッセージの取得に失敗しました");
  const data: MessageListResponse = await response.json();
  return data.results;
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ApiMessage> {
  const response = await fetch(
    apiUrl(`/api/conversations/${conversationId}/messages/`),
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ content }),
    },
  );
  if (!response.ok) throw new Error("メッセージの送信に失敗しました");
  return response.json();
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await fetch(apiUrl(`/api/conversations/${conversationId}/mark-read/`), {
    method: "PATCH",
    headers: buildAuthHeaders(),
  });
}
