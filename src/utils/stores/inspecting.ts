import { create } from "zustand";

interface InspectingStore {
    inspecting: boolean;
    setInspecting: (value: boolean) => void;
}

export const useInspectingStore = create<InspectingStore>((set) => ({
    inspecting: false,
    setInspecting: (value) => set({ inspecting: value }),
}));
