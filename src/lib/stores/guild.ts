import { create } from "zustand";

type GuildStore = {
    guild: string | null;
    setGuild: (guild: string | null) => void;
};

export const useGuildStore = create<GuildStore>((set) => ({
    guild: null,
    setGuild: (guild) => {
        if (guild) {
            localStorage.setItem("guildId", guild);
        } else {
            localStorage.removeItem("guildId");
        }
        set({ guild });
    },
}));

// optional helper to get persisted guildId directly
export const getStoredGuildId = () => localStorage.getItem("guildId");
