import { create } from "zustand";

interface TdsProgressStore {
  maxStepReached: number;
  setMaxStepReached: (step: number) => void;
  isSubmitted: boolean;
  setIsSubmitted: (isSubmitted: boolean) => void;
  reset: () => void;
}

export const useTdsProgressStore = create<TdsProgressStore>((set) => ({
  maxStepReached: 1,
  setMaxStepReached: (step) =>
    set((state) => ({ maxStepReached: Math.max(state.maxStepReached, step) })),
  isSubmitted: false,
  setIsSubmitted: (isSubmitted) => set({ isSubmitted }),
  reset: () => set({ maxStepReached: 1, isSubmitted: false }),
}));
