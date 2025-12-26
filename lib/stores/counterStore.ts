import { create } from "zustand";
import { devtools } from "zustand/middleware";

type CounterStore = {
  value: number;
  increment: () => void;
  decrement: () => void;
  add: (amount: number) => void;
  reset: () => void;
};

export const useCounterStore = create<CounterStore>()(
  devtools(
    (set) => ({
      value: 0,
      increment: () => set((state) => ({ value: state.value + 1 })),
      decrement: () => set((state) => ({ value: state.value - 1 })),
      add: (amount) => set((state) => ({ value: state.value + amount })),
      reset: () => set({ value: 0 })
    }),
    { name: "counter" }
  )
);
