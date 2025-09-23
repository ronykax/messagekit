import type { APIGuild } from "discord-api-types/v10";
import { create } from "zustand";

type GuildStore = {
    guild: APIGuild | null;
    setGuild: (guild: APIGuild | null) => void;
};

export const useGuildStore = create<GuildStore>((set) => ({
    guild: null,
    setGuild: (guild) => {
        if (guild) {
            localStorage.setItem("guildId", guild.id);
        } else {
            localStorage.removeItem("guildId");
        }
        set({ guild });
    },
}));

// optional helper to get persisted guildId directly
export const getStoredGuildId = () => localStorage.getItem("guildId");
