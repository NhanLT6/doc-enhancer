/**
 * localStorage wrapper for managing documents and enhancement history
 * Provides CRUD operations with TypeScript types
 */

export interface DocumentImage {
  data: string; // Base64 data URI
  alt: string;
  width: number;
  height: number;
}

export interface DocumentMetadata {
  summary: string; // 3-5 sentence summary of the document
  styleGuide: {
    tone: string; // e.g., "formal technical", "conversational", "academic"
    vocabulary: string[]; // 10-15 domain-specific terms used consistently
    perspective: string; // "first-person", "third-person", "imperative"
    technicalLevel: string; // "beginner", "intermediate", "expert"
    commonPatterns: string[]; // Recurring sentence structures or phrases
  };
  keyTerms: string[]; // Important technical terms, product names, acronyms to preserve
  documentType: string; // e.g., "API documentation", "user guide", "technical specification"
}

export interface Document {
  id: string;
  name: string;
  confluenceUrl: string;
  content: any; // Tiptap JSON format - stores rich content with embedded images
  metadata?: DocumentMetadata; // AI-generated metadata for context-aware enhancements
  createdAt: string;
  updatedAt: string;
}

export interface EnhancementRecord {
  id: string;
  documentId: string;
  originalContent: any; // Tiptap JSON
  enhancedContent: any; // Tiptap JSON
  instructions: string;
  createdAt: string;
}

class LocalStorage {
  private getKey(type: string): string {
    return `doc-enhancer:${type}`;
  }

  // ========== Documents ==========

  getDocuments(): Document[] {
    const data = localStorage.getItem(this.getKey('documents'));
    return data ? JSON.parse(data) : [];
  }

  getDocument(id: string): Document | null {
    const docs = this.getDocuments();
    return docs.find((d) => d.id === id) || null;
  }

  saveDocuments(docs: Document[]): void {
    localStorage.setItem(this.getKey('documents'), JSON.stringify(docs));
  }

  addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document {
    const documents = this.getDocuments();
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    documents.push(newDoc);
    this.saveDocuments(documents);
    return newDoc;
  }

  updateDocument(id: string, updates: Partial<Document>): Document | null {
    const documents = this.getDocuments();
    const index = documents.findIndex((d) => d.id === id);

    if (index === -1) {
      return null;
    }

    documents[index] = {
      ...documents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDocuments(documents);
    return documents[index];
  }

  deleteDocument(id: string): boolean {
    const documents = this.getDocuments();
    const filteredDocs = documents.filter((d) => d.id !== id);

    if (filteredDocs.length === documents.length) {
      return false; // Document not found
    }

    this.saveDocuments(filteredDocs);

    // Also delete related history
    const history = this.getHistory().filter((h) => h.documentId !== id);
    localStorage.setItem(this.getKey('history'), JSON.stringify(history));

    return true;
  }

  // ========== Enhancement History ==========

  getHistory(documentId?: string): EnhancementRecord[] {
    const data = localStorage.getItem(this.getKey('history'));
    const history: EnhancementRecord[] = data ? JSON.parse(data) : [];
    return documentId ? history.filter((h) => h.documentId === documentId) : history;
  }

  addHistory(record: Omit<EnhancementRecord, 'id' | 'createdAt'>): EnhancementRecord {
    const history = this.getHistory();
    const newRecord: EnhancementRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    history.push(newRecord);
    localStorage.setItem(this.getKey('history'), JSON.stringify(history));
    return newRecord;
  }

  getLatestEnhancement(documentId: string): EnhancementRecord | null {
    const history = this.getHistory(documentId);
    if (history.length === 0) return null;

    // Sort by createdAt descending and return the first
    return history.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }

  deleteHistory(id: string): boolean {
    const history = this.getHistory();
    const filteredHistory = history.filter((h) => h.id !== id);

    if (filteredHistory.length === history.length) {
      return false; // Record not found
    }

    localStorage.setItem(this.getKey('history'), JSON.stringify(filteredHistory));
    return true;
  }

  // ========== Utility Methods ==========

  clearAll(): void {
    localStorage.removeItem(this.getKey('documents'));
    localStorage.removeItem(this.getKey('history'));
  }

  exportData(): string {
    return JSON.stringify(
      {
        documents: this.getDocuments(),
        history: this.getHistory(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  importData(jsonString: string): {
    success: boolean;
    documentsImported: number;
    historyImported: number;
    error?: string;
  } {
    try {
      const data = JSON.parse(jsonString);

      if (!data.documents || !Array.isArray(data.documents)) {
        return {
          success: false,
          documentsImported: 0,
          historyImported: 0,
          error: 'Invalid data format: documents array not found',
        };
      }

      if (data.documents) {
        this.saveDocuments(data.documents);
      }

      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(this.getKey('history'), JSON.stringify(data.history));
      }

      return {
        success: true,
        documentsImported: data.documents?.length || 0,
        historyImported: data.history?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        documentsImported: 0,
        historyImported: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getStorageSize(): { used: number; available: number; percentage: number } {
    let total = 0;

    // Calculate total localStorage usage
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }

    // Most browsers have a 5-10MB limit
    const limit = 10 * 1024 * 1024; // 10MB
    const used = total * 2; // UTF-16 encoding uses 2 bytes per character
    const available = limit - used;
    const percentage = (used / limit) * 100;

    return {
      used,
      available,
      percentage: Math.round(percentage * 100) / 100,
    };
  }
}

// Export singleton instance
export const storage = new LocalStorage();
