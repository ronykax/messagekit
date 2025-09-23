import type { APIMessageTopLevelComponent } from "discord-api-types/v10";
import { create } from "zustand";

type OutputStore = {
    output: APIMessageTopLevelComponent[];
    setOutput: (output: APIMessageTopLevelComponent[]) => void;
};

export const useOutputStore = create<OutputStore>((set) => ({
    output: [],
    setOutput: (output) => set({ output }),
}));
