import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

type UserStore = {
    user: User | null | undefined;
    setUser: (user: User | null | undefined) => void;
};

export const useUserStore = create<UserStore>((set) => ({
    user: undefined,
    setUser: (user) => set({ user }),
}));
