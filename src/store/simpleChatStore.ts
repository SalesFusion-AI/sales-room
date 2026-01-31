import { create } from 'zustand';

// Simple store without service dependencies
interface SimpleChatStore {
  count: number;
  isTyping: boolean;
  increment: () => void;
  setTyping: (typing: boolean) => void;
}

export const useSimpleChatStore = create<SimpleChatStore>((set) => ({
  count: 0,
  isTyping: false,
  increment: () => set((state) => ({ count: state.count + 1 })),
  setTyping: (typing) => set({ isTyping: typing }),
}));

// Simple selector hooks for testing
export const useIsTyping = () => useSimpleChatStore((state) => state.isTyping);
export const useCount = () => useSimpleChatStore((state) => state.count);