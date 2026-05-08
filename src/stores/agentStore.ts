import { create } from 'zustand';
import type { AgentAction, AgentStreamStatus, ChatMessage, LLMResearchAnalysis } from '@/lib/agent/types';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
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
  chatMessages: [],
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
    set((state) => ({
      researchCache: {
        ...state.researchCache,
        [analysis.clusterTitle]: { analysis, cachedAt: Date.now() },
      },
    }));
  },

  addChatTurn: (turn) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, turn],
    }));
  },

  clearChat: () => {
    set({ chatMessages: [] });
  },
}));
