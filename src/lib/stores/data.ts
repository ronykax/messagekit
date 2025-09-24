import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { create } from "zustand";

type Template = { template_id: string; name: string };
type Guild = RESTAPIPartialCurrentUserGuild;

type State = {
    templates: Template[] | null;
    guilds: Guild[] | null;
    fetched: boolean;
    setTemplates: (templates: Template[]) => void;
    setGuilds: (guilds: Guild[]) => void;
    setFetched: (fetched: boolean) => void;
};

export const useDataStore = create<State>((set) => ({
    templates: null,
    guilds: null,
    fetched: false,
    setTemplates: (templates) => set({ templates }),
    setGuilds: (guilds) => set({ guilds }),
    setFetched: (fetched) => set({ fetched }),
}));
