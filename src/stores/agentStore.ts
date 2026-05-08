import { create } from 'zustand';
import type {
  AgentAction,
  AgentStreamStatus,
  ChatMessage,
  LLMResearchAnalysis,
} from '@/lib/agent/types';

const RESEARCH_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const RESEARCH_CACHE_MAX_ENTRIES = 50;
const CHAT_STORAGE_KEY = 'publio-agent-chat';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function loadChatFromStorage(): ChatTurn[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatTurn[]) : [];
  } catch {
    return [];
  }
}

function saveChatToStorage(messages: ChatTurn[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore storage errors
  }
}

interface AgentStore {
  // 流式输出状态
  status: AgentStreamStatus;
  output: string;
  error: string | null;
  activeAction: AgentAction | null;

  // AbortController 用于取消正在进行的请求
  abortController: AbortController | null;

  // 多轮对话历史
  chatMessages: ChatTurn[];

  // Research 结果缓存（按 clusterTitle 索引，带 TTL）
  researchCache: Record<string, { analysis: LLMResearchAnalysis; cachedAt: number }>;

  // Actions
  startStream: (action: AgentAction) => AbortController;
  appendOutput: (delta: string) => void;
  finishStream: () => void;
  setError: (error: string) => void;
  abort: () => void;
  reset: () => void;
  cacheResearch: (analysis: LLMResearchAnalysis) => void;

  // Chat actions
  addChatTurn: (turn: ChatTurn) => void;
  clearChat: () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  status: 'idle',
  output: '',
  error: null,
  activeAction: null,
  abortController: null,
  chatMessages: loadChatFromStorage(),
  researchCache: {},

  startStream: (action) => {
    // 取消之前的请求（如有）
    get().abortController?.abort();

    const controller = new AbortController();
    set({
      status: 'streaming',
      output: '',
      error: null,
      activeAction: action,
      abortController: controller,
    });
    return controller;
  },

  appendOutput: (delta) => {
    set((state) => ({ output: state.output + delta }));
  },

  finishStream: () => {
    set({ status: 'done', abortController: null });
  },

  setError: (error) => {
    set({ status: 'error', error, abortController: null });
  },

  abort: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ status: 'idle', abortController: null });
    }
  },

  reset: () => {
    get().abortController?.abort();
    set({
      status: 'idle',
      output: '',
      error: null,
      activeAction: null,
      abortController: null,
    });
  },

  cacheResearch: (analysis) => {
    set((state) => {
      const now = Date.now();
      // Remove expired entries
      const filtered: typeof state.researchCache = {};
      for (const [key, entry] of Object.entries(state.researchCache)) {
        if (now - entry.cachedAt <= RESEARCH_CACHE_TTL_MS) {
          filtered[key] = entry;
        }
      }
      // Enforce LRU limit: remove oldest entries if over capacity
      const entries = Object.entries(filtered);
      if (entries.length >= RESEARCH_CACHE_MAX_ENTRIES) {
        entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
        for (let i = 0; i <= entries.length - RESEARCH_CACHE_MAX_ENTRIES; i++) {
          delete filtered[entries[i][0]];
        }
      }
      return {
        researchCache: {
          ...filtered,
          [analysis.clusterTitle]: { analysis, cachedAt: now },
        },
      };
    });
  },

  addChatTurn: (turn) => {
    set((state) => {
      const updated = [...state.chatMessages, turn];
      saveChatToStorage(updated);
      return { chatMessages: updated };
    });
  },

  clearChat: () => {
    saveChatToStorage([]);
    set({ chatMessages: [] });
  },
}));
