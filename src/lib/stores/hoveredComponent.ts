import { create } from "zustand";

interface HoveredComponentStore {
    hoveredComponent: number | null;
    setHoveredComponent: (id: number | null) => void;
}

export const useHoveredComponentStore = create<HoveredComponentStore>((set) => ({
    hoveredComponent: null,
    setHoveredComponent: (id) => set({ hoveredComponent: id }),
}));
