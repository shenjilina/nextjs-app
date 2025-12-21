import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User } from "@/types/users";

type UserStore = {
  name: string | null;
  loading: boolean;
  userInfo: User | null;
  setName: (name: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUserInfo: (userInfo: User | null) => void;
  reset: () => void;
};

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      name: null,
      loading: false,
      userInfo: null,
      setName: (name) => set({ name }),
      setLoading: (loading) => set({ loading }),
      setUserInfo: (userInfo) => set({ userInfo }),
      reset: () =>
        set({
          name: null,
          loading: false,
          userInfo: null
        })
    }),
    { name: "user" }
  )
);

