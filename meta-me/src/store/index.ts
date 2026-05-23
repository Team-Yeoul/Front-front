import { create } from 'zustand';
import type { DiaryEntry, User } from '@/types';

interface DiaryStore {
  entries: DiaryEntry[];
  setEntries: (entries: DiaryEntry[]) => void;
  addEntry: (entry: DiaryEntry) => void;
  removeEntry: (id: string) => void;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

interface UIStore {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
}

export const useDiaryStore = create<DiaryStore>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
  removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
}));

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useUIStore = create<UIStore>((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
