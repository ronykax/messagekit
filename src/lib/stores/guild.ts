import { create } from "zustand";

type GuildStore = {
    guild: string | null;
    setGuild: (guild: string | null) => void;
};

export const useGuildStore = create<GuildStore>((set) => ({
    guild: typeof window !== "undefined" ? localStorage.getItem("guildId") : null,
    setGuild: (guild) => {
        if (guild) {
            localStorage.setItem("guildId", guild);
        } else {
            localStorage.removeItem("guildId");
        }
        set({ guild });
    },
}));

export const getStoredGuildId = () =>
    typeof window !== "undefined" ? localStorage.getItem("guildId") : null;
