import { create } from 'zustand';
import type { AgentAction, AgentStreamStatus, LLMResearchAnalysis } from '@/lib/agent/types';

interface AgentStore {
  // 流式输出状态
  status: AgentStreamStatus;
  output: string;
  error: string | null;
  activeAction: AgentAction | null;

  // AbortController 用于取消正在进行的请求
  abortController: AbortController | null;

  // Research 结果缓存（按 clusterTitle 索引）
  researchCache: Record<string, LLMResearchAnalysis>;

  // Actions
  startStream: (action: AgentAction) => AbortController;
  appendOutput: (delta: string) => void;
  finishStream: () => void;
  setError: (error: string) => void;
  abort: () => void;
  reset: () => void;
  cacheResearch: (analysis: LLMResearchAnalysis) => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  status: 'idle',
  output: '',
  error: null,
  activeAction: null,
  abortController: null,
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
        [analysis.clusterTitle]: analysis,
      },
    }));
  },
}));
