import { create } from "zustand";

type FileStore = {
    files: File[];
    setFiles: (files: File[]) => void;
};

export const useFiles = create<FileStore>((set) => ({
    files: [],
    setFiles: (files) => set({ files }),
}));
