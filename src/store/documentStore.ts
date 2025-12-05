/**
 * Zustand store for global document state management
 */

import { create } from 'zustand';
import type { Document, EnhancementRecord } from '@/lib/storage';

interface DocumentStore {
  // State
  documents: Document[];
  currentDocument: Document | null;
  enhancementHistory: EnhancementRecord[];
  isLoading: boolean;

  // Actions - Documents
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setCurrentDocument: (doc: Document | null) => void;

  // Actions - Enhancement History
  setEnhancementHistory: (history: EnhancementRecord[]) => void;
  addEnhancement: (record: EnhancementRecord) => void;

  // Actions - UI State
  setLoading: (loading: boolean) => void;

  // Utility
  getDocument: (id: string) => Document | undefined;
  clearAll: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Initial state
  documents: [],
  currentDocument: null,
  enhancementHistory: [],
  isLoading: false,

  // Document actions
  setDocuments: (docs) => set({ documents: docs }),

  addDocument: (doc) =>
    set((state) => ({
      documents: [...state.documents, doc],
    })),

  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
      currentDocument:
        state.currentDocument?.id === id
          ? { ...state.currentDocument, ...updates }
          : state.currentDocument,
    })),

  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
      currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
    })),

  setCurrentDocument: (doc) => set({ currentDocument: doc }),

  // Enhancement history actions
  setEnhancementHistory: (history) => set({ enhancementHistory: history }),

  addEnhancement: (record) =>
    set((state) => ({
      enhancementHistory: [...state.enhancementHistory, record],
    })),

  // UI state actions
  setLoading: (loading) => set({ isLoading: loading }),

  // Utility functions
  getDocument: (id) => get().documents.find((doc) => doc.id === id),

  clearAll: () =>
    set({
      documents: [],
      currentDocument: null,
      enhancementHistory: [],
      isLoading: false,
    }),
}));
