import { useCallback, useEffect, useSyncExternalStore } from "react";

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AiConversationRecord {
  id: string;
  title: string;
  subject: string | null;
  messages: AiChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface AiSavedTask {
  id: string;
  title: string;
  details: string | null;
  subject: string;
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface AiSavedFlashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
}

export interface AiSavedNote {
  id: string;
  subject: string;
  title: string;
  content: string;
  created_at: string;
}

export interface AiSavedLibrary {
  tasks: AiSavedTask[];
  flashcards: AiSavedFlashcard[];
  notes: AiSavedNote[];
}

const CONVERSATIONS_KEY = "btc.ai.conversations.v1";
const LIBRARY_KEY = "btc.ai.saved_library.v1";
const STORE_EVENT = "btc:ai-store-updated";

const EMPTY_CONVERSATIONS: AiConversationRecord[] = [];
const EMPTY_LIBRARY: AiSavedLibrary = { tasks: [], flashcards: [], notes: [] };

let cachedConversationsRaw: string | null | undefined;
let cachedConversationsParsed: AiConversationRecord[] = EMPTY_CONVERSATIONS;

let cachedLibraryRaw: string | null | undefined;
let cachedLibraryParsed: AiSavedLibrary = EMPTY_LIBRARY;

function createAiId(prefix = "ai"): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${random}`;
}

export function sanitizeAiHttpUrl(raw: string | null | undefined, maxLen = 512): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().slice(0, maxLen);
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString().slice(0, maxLen);
    }
    return null;
  } catch {
    return null;
  }
}

function emitStoreChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORE_EVENT));
  }
}

function readConversationsSnapshot(): AiConversationRecord[] {
  if (typeof window === "undefined") return EMPTY_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (raw === cachedConversationsRaw) return cachedConversationsParsed;
    cachedConversationsRaw = raw;
    if (!raw) {
      cachedConversationsParsed = EMPTY_CONVERSATIONS;
      return cachedConversationsParsed;
    }
    const parsed = JSON.parse(raw);
    cachedConversationsParsed = Array.isArray(parsed)
      ? (parsed as AiConversationRecord[]).sort((a, b) =>
          (b.updated_at || "").localeCompare(a.updated_at || ""),
        )
      : EMPTY_CONVERSATIONS;
    return cachedConversationsParsed;
  } catch {
    return EMPTY_CONVERSATIONS;
  }
}

function writeConversations(rows: AiConversationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    const sorted = [...rows].sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
    const json = JSON.stringify(sorted.slice(0, 40));
    localStorage.setItem(CONVERSATIONS_KEY, json);
    cachedConversationsRaw = json;
    cachedConversationsParsed = sorted.slice(0, 40);
    emitStoreChange();
  } catch {
    /* ignore storage quota limits */
  }
}

function readLibrarySnapshot(): AiSavedLibrary {
  if (typeof window === "undefined") return EMPTY_LIBRARY;
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw === cachedLibraryRaw) return cachedLibraryParsed;
    cachedLibraryRaw = raw;
    if (!raw) {
      cachedLibraryParsed = EMPTY_LIBRARY;
      return cachedLibraryParsed;
    }
    const parsed = JSON.parse(raw) as Partial<AiSavedLibrary> | null;
    cachedLibraryParsed = {
      tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : [],
      flashcards: Array.isArray(parsed?.flashcards) ? parsed.flashcards : [],
      notes: Array.isArray(parsed?.notes) ? parsed.notes : [],
    };
    return cachedLibraryParsed;
  } catch {
    return EMPTY_LIBRARY;
  }
}

function writeLibrary(next: AiSavedLibrary): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed: AiSavedLibrary = {
      tasks: next.tasks.slice(0, 60),
      flashcards: next.flashcards.slice(0, 80),
      notes: next.notes.slice(0, 60),
    };
    const json = JSON.stringify(trimmed);
    localStorage.setItem(LIBRARY_KEY, json);
    cachedLibraryRaw = json;
    cachedLibraryParsed = trimmed;
    emitStoreChange();
  } catch {
    /* ignore storage quota limits */
  }
}

function subscribeStore(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (ev: StorageEvent) => {
    if (!ev.key || ev.key === CONVERSATIONS_KEY || ev.key === LIBRARY_KEY) {
      listener();
    }
  };
  window.addEventListener(STORE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(STORE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function saveLocalAiNote(payload: {
  subject: string;
  title: string;
  content: string;
}): AiSavedNote {
  const lib = readLibrarySnapshot();
  const note: AiSavedNote = {
    id: createAiId("ainote"),
    subject: payload.subject.trim().slice(0, 60) || "General",
    title: payload.title.trim().slice(0, 160) || "Study Note",
    content: payload.content.trim().slice(0, 6000),
    created_at: new Date().toISOString(),
  };
  writeLibrary({ ...lib, notes: [note, ...lib.notes] });
  return note;
}

export function saveLocalAiTask(payload: {
  title: string;
  details: string | null;
  subject: string;
  priority: "low" | "medium" | "high";
}): AiSavedTask {
  const lib = readLibrarySnapshot();
  const task: AiSavedTask = {
    id: createAiId("aitask"),
    title: payload.title.trim().slice(0, 160),
    details: payload.details ? payload.details.trim().slice(0, 1000) : null,
    subject: payload.subject.trim().slice(0, 60) || "General",
    priority: payload.priority,
    created_at: new Date().toISOString(),
  };
  writeLibrary({ ...lib, tasks: [task, ...lib.tasks] });
  return task;
}

export function saveLocalAiFlashcard(payload: {
  front: string;
  back: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
}): AiSavedFlashcard {
  const lib = readLibrarySnapshot();
  const card: AiSavedFlashcard = {
    id: createAiId("aicard"),
    front: payload.front.trim().slice(0, 200),
    back: payload.back.trim().slice(0, 1500),
    subject: payload.subject.trim().slice(0, 60) || "General",
    difficulty: payload.difficulty,
    created_at: new Date().toISOString(),
  };
  writeLibrary({ ...lib, flashcards: [card, ...lib.flashcards] });
  return card;
}

function getConversationsServerSnapshot(): AiConversationRecord[] {
  return EMPTY_CONVERSATIONS;
}

function getLibraryServerSnapshot(): AiSavedLibrary {
  return EMPTY_LIBRARY;
}

export function useLocalAiConversations() {
  const conversations = useSyncExternalStore(
    subscribeStore,
    readConversationsSnapshot,
    getConversationsServerSnapshot,
  );

  useEffect(() => {
    readConversationsSnapshot();
  }, []);

  const saveConversation = useCallback(
    async (conv: {
      id?: string;
      title: string;
      subject?: string | null;
      messages: AiChatMessage[];
    }): Promise<AiConversationRecord> => {
      const current = readConversationsSnapshot();
      const now = new Date().toISOString();
      const cleanMessages = conv.messages.slice(-60).map((m) => ({
        id: m.id.slice(0, 64),
        role: m.role,
        content: m.content.slice(0, 6000),
        created_at: m.created_at.slice(0, 40),
      }));

      const existing = conv.id ? current.find((c) => c.id === conv.id) : undefined;
      if (existing) {
        const updated: AiConversationRecord = {
          ...existing,
          title: conv.title.trim().slice(0, 160) || existing.title,
          subject: (conv.subject ?? existing.subject ?? "General").slice(0, 60),
          messages: cleanMessages,
          updated_at: now,
        };
        writeConversations(current.map((c) => (c.id === updated.id ? updated : c)));
        return updated;
      }

      const created: AiConversationRecord = {
        id: conv.id ?? createAiId("chat"),
        title: conv.title.trim().slice(0, 160) || "Study Session",
        subject: conv.subject ? conv.subject.trim().slice(0, 60) : null,
        messages: cleanMessages,
        created_at: now,
        updated_at: now,
      };
      writeConversations([created, ...current]);
      return created;
    },
    [],
  );

  const renameConversation = useCallback(async (id: string, title: string) => {
    const clean = title.trim().slice(0, 160);
    if (!clean) return;
    const current = readConversationsSnapshot();
    const now = new Date().toISOString();
    writeConversations(
      current.map((c) => (c.id === id ? { ...c, title: clean, updated_at: now } : c)),
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    const current = readConversationsSnapshot();
    writeConversations(current.filter((c) => c.id !== id));
  }, []);

  return {
    conversations,
    saveConversation,
    renameConversation,
    deleteConversation,
  };
}

export function useLocalAiLibrary() {
  const library = useSyncExternalStore(
    subscribeStore,
    readLibrarySnapshot,
    getLibraryServerSnapshot,
  );

  const removeTask = useCallback((id: string) => {
    const lib = readLibrarySnapshot();
    writeLibrary({ ...lib, tasks: lib.tasks.filter((t) => t.id !== id) });
  }, []);

  const removeFlashcard = useCallback((id: string) => {
    const lib = readLibrarySnapshot();
    writeLibrary({ ...lib, flashcards: lib.flashcards.filter((c) => c.id !== id) });
  }, []);

  const removeNote = useCallback((id: string) => {
    const lib = readLibrarySnapshot();
    writeLibrary({ ...lib, notes: lib.notes.filter((n) => n.id !== id) });
  }, []);

  return {
    ...library,
    saveTask: saveLocalAiTask,
    saveFlashcard: saveLocalAiFlashcard,
    saveNote: saveLocalAiNote,
    removeTask,
    removeFlashcard,
    removeNote,
  };
}
