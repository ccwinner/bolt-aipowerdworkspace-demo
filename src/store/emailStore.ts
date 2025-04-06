import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmailState {
  emailTemplate: string | null;
  setEmailTemplate: (template: string) => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set) => ({
      emailTemplate: null,
      setEmailTemplate: (template) => set({ emailTemplate: template }),
    }),
    {
      name: 'email-storage',
    }
  )
);