import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DraftNote {
  title: string
  content: string
  tag: string
}

interface NoteStore {
  draft: DraftNote
  setDraft: (note: Partial<DraftNote>) => void
  clearDraft: () => void
}

const initialDraft: DraftNote = {
  title: '',
  content: '',
  tag: 'Todo',
}

export const useNoteStore = create<NoteStore>()(
  persist(
    set => ({
      draft: initialDraft,
      setDraft: updatedFields =>
        set(state => ({
          draft: { ...state.draft, ...updatedFields },
        })),
      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: 'notehub-draft-storage', // Ключ у localStorage
    }
  )
)
