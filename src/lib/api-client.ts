/**
 * API client for calling backend Vercel functions
 */

import type { DocumentImage } from './storage';

export interface ConfluenceResponse {
  content: string; // HTML content
  title: string;
  version: number;
  lastModified: string;
}

export interface EnhanceRequest {
  fullDocument: string;
  paragraphWithSelection: string;
  selectedText: string;
  instructions?: string;
  documentName?: string;
}

export interface EnhanceResponse {
  originalTextToReplace: string;
  newText: string;
  model: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface PdfToMarkdownResponse {
  markdown: string;
  images: DocumentImage[];
  model: string;
  imageCount: number;
}

/**
 * Fetch content from Confluence via our API
 */
export async function fetchFromConfluence(
  confluenceUrl: string,
  credentials: {
    confluenceToken: string;
    confluenceEmail: string;
  }
): Promise<ConfluenceResponse> {
  const response = await fetch('/api/confluence-fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      confluenceUrl,
      confluenceToken: credentials.confluenceToken,
      confluenceEmail: credentials.confluenceEmail,
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch from Confluence');
  }

  return response.json();
}

/**
 * Enhance selected text using "Marked Local Context" strategy
 * Sends full document + paragraph with <target> tags
 */
export async function enhanceContent(request: EnhanceRequest): Promise<EnhanceResponse> {
  const response = await fetch('/api/enhance-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to enhance content');
  }

  return response.json();
}

/**
 * Convert a File object to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the "data:application/pdf;base64," prefix
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Convert PDF to Markdown using Gemini AI via our API
 * Returns markdown with {{IMAGE_N}} placeholders and images array
 */
export async function convertPdfToMarkdown(
  file: File
): Promise<{ markdown: string; images: DocumentImage[] }> {
  // Convert file to base64
  const fileData = await fileToBase64(file);

  const response = await fetch('/api/pdf-to-markdown', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileData,
      fileName: file.name,
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to convert PDF to markdown');
  }

  const data: PdfToMarkdownResponse = await response.json();
  return {
    markdown: data.markdown,
    images: data.images,
  };
}

/**
 * Extract the paragraph containing a text selection
 * Returns the paragraph with the selection wrapped in <target> tags
 */
export function extractParagraphWithSelection(
  fullText: string,
  selectionStart: number,
  selectionEnd: number
): {
  paragraphWithSelection: string;
  selectedText: string;
} {
  const selectedText = fullText.substring(selectionStart, selectionEnd);

  // Find paragraph boundaries (double newlines or start/end of text)
  let paragraphStart = selectionStart;
  let paragraphEnd = selectionEnd;

  // Search backwards for paragraph start
  while (paragraphStart > 0) {
    if (fullText[paragraphStart - 1] === '\n' && fullText[paragraphStart - 2] === '\n') {
      break;
    }
    paragraphStart--;
  }

  // Search forwards for paragraph end
  while (paragraphEnd < fullText.length) {
    if (fullText[paragraphEnd] === '\n' && fullText[paragraphEnd + 1] === '\n') {
      break;
    }
    paragraphEnd++;
  }

  // Extract paragraph
  const paragraph = fullText.substring(paragraphStart, paragraphEnd).trim();

  // Find selection within paragraph
  const selectionInParagraph = selectedText;
  const selectionIndexInParagraph = paragraph.indexOf(selectionInParagraph);

  if (selectionIndexInParagraph === -1) {
    // Fallback: just wrap the whole selection
    return {
      paragraphWithSelection: `<target>${selectedText}</target>`,
      selectedText,
    };
  }

  // Insert <target> tags around selection
  const before = paragraph.substring(0, selectionIndexInParagraph);
  const after = paragraph.substring(selectionIndexInParagraph + selectionInParagraph.length);
  const paragraphWithSelection = `${before}<target>${selectionInParagraph}</target>${after}`;

  return {
    paragraphWithSelection,
    selectedText,
  };
}
