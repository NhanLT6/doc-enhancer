/**
 * API client for calling backend Vercel functions
 */

import type { DocumentMetadata } from './storage';

export interface ConfluenceResponse {
  content: string; // HTML content
  title: string;
  version: number;
  lastModified: string;
}

export interface EnhanceRequest {
  fullDocumentHtml: string;
  targetBlockHtml: string;
  instructions?: string;
  documentName?: string;
  metadata?: DocumentMetadata;
}

export interface EnhanceResponse {
  action: 'replace';
  newHtml: string;
  model: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface PdfToHtmlResponse {
  html: string;
  imageCount: number;
  model: string;
}

export interface AnalyzeDocumentRequest {
  fullDocumentHtml: string;
  documentName?: string;
}

export interface AnalyzeDocumentResponse extends DocumentMetadata {
  model: string;
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
 * Enhance selected text using "Marked Local Context" strategy with HTML
 * Sends full document HTML + parent node HTML with <target> tags
 * Preserves HTML structure (tables, lists, formatting)
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
 * Convert PDF to HTML using Gemini AI via our API
 * Returns HTML with images embedded as <img> tags with base64 data URIs
 */
export async function convertPdfToHtml(file: File): Promise<{ html: string; imageCount: number }> {
  // Convert file to base64
  const fileData = await fileToBase64(file);

  const response = await fetch('/api/pdf-to-html', {
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
    throw new Error(error.error || 'Failed to convert PDF to HTML');
  }

  const data: PdfToHtmlResponse = await response.json();
  return {
    html: data.html,
    imageCount: data.imageCount,
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

/**
 * Analyze document and extract metadata using Gemini AI
 * Returns summary, style guide, key terms, and document type
 */
export async function analyzeDocument(
  request: AnalyzeDocumentRequest
): Promise<DocumentMetadata> {
  const response = await fetch('/api/analyze-document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to analyze document');
  }

  const data: AnalyzeDocumentResponse = await response.json();

  // Return just the metadata, without the model field
  return {
    summary: data.summary,
    styleGuide: data.styleGuide,
    keyTerms: data.keyTerms,
    documentType: data.documentType,
  };
}
