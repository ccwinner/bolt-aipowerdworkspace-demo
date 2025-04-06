import { create } from 'zustand';

interface RoadmapState {
  roadmapContent: string | null;
  setRoadmapContent: (content: string) => void;
  isEditMode: boolean;
  setEditMode: (isEdit: boolean) => void;
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  roadmapContent: null,
  setRoadmapContent: (content) => set({ roadmapContent: content }),
  isEditMode: false,
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),
}));