import { CHAT_THREADS, type ChatThread } from "@/lib/mock-data";

export type StoredChatMessage = {
  id: number;
  mine: boolean;
  text: string;
  time: string;
};

type ApplicationChatInput = {
  projectId: number;
  projectTitle: string;
  hostName: string;
  hostInitial: string;
  role: string;
  openingMessage: string;
};

const GENERATED_CHAT_THREADS_KEY = "generatedChatThreads";

function readGeneratedThreads(): ChatThread[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(GENERATED_CHAT_THREADS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ChatThread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGeneratedThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GENERATED_CHAT_THREADS_KEY, JSON.stringify(threads));
}

function getChatStorageKey(threadId: number) {
  return `chat-thread-${threadId}`;
}

export function getAllChatThreads() {
  return [...readGeneratedThreads(), ...CHAT_THREADS];
}

export function getStoredChatMessages(threadId: number, fallback: StoredChatMessage[]) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(getChatStorageKey(threadId));
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as StoredChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveChatMessages(threadId: number, messages: StoredChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getChatStorageKey(threadId), JSON.stringify(messages));
}

export function createApplicationChatThread(input: ApplicationChatInput) {
  const generatedThreads = readGeneratedThreads();
  const existingThread = generatedThreads.find(
    (thread) => thread.project === input.projectTitle && thread.title === input.hostName,
  );
  const nextId = existingThread
    ? existingThread.id
    : getAllChatThreads().reduce((maxId, thread) => Math.max(maxId, thread.id), 0) + 1;
  const replyText = `参加申請ありがとうございます。${input.role}の件、このチャットで詳細を進めましょう。`;

  const nextThread: ChatThread = {
    id: nextId,
    title: input.hostName,
    preview: replyText,
    time: "今",
    online: true,
    accent: "#8aff1d",
    avatar: input.hostInitial,
    project: input.projectTitle,
    role: input.role,
    unreadCount: 1,
    pinned: true,
  };

  writeGeneratedThreads([nextThread, ...generatedThreads.filter((thread) => thread.id !== nextId)].slice(0, 30));

  const existingMessages = getStoredChatMessages(nextId, []);
  if (existingMessages.length === 0) {
    saveChatMessages(nextId, [
      {
        id: 1,
        mine: true,
        text: input.openingMessage,
        time: "今",
      },
      {
        id: 2,
        mine: false,
        text: replyText,
        time: "今",
      },
    ]);
  }

  return nextThread;
}