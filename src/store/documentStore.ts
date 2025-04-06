import { create } from 'zustand';

interface DocumentState {
  documentContent: string | null;
  setDocumentContent: (content: string) => void;
  isEditMode: boolean;
  setEditMode: (isEdit: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documentContent: null,
  setDocumentContent: (content) => set({ documentContent: content }),
  isEditMode: false,
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),
}));