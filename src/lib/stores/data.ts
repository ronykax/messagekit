import { create } from "zustand";
import type { Guild, RowAction, RowTemplate } from "@/utils/types";

type State = {
    templates: RowTemplate[] | null;
    actions: RowAction[] | null;
    guilds: Guild[] | null;
    fetched: boolean;
    setTemplates: (templates: RowTemplate[] | null) => void;
    setActions: (actions: RowAction[] | null) => void;
    setGuilds: (guilds: Guild[]) => void;
    setFetched: (fetched: boolean) => void;
};

export const useDataStore = create<State>((set) => ({
    templates: null,
    actions: null,
    guilds: null,
    fetched: false,
    setTemplates: (templates) => set({ templates }),
    setActions: (actions) => set({ actions }),
    setGuilds: (guilds) => set({ guilds }),
    setFetched: (fetched) => set({ fetched }),
}));
