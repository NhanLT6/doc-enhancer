/**
 * API client for calling backend Vercel functions
 */

export interface ConfluenceResponse {
  content: string; // HTML content
  title: string;
  version: number;
  lastModified: string;
}

export interface EnhanceResponse {
  enhancedContent: string;
  model: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

/**
 * Fetch content from Confluence via our API
 */
export async function fetchFromConfluence(confluenceUrl: string): Promise<ConfluenceResponse> {
  const url = `/api/confluence-fetch?confluenceUrl=${encodeURIComponent(confluenceUrl)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch from Confluence');
  }

  return response.json();
}

/**
 * Enhance content using Gemini AI via our API
 */
export async function enhanceContent(
  content: string,
  instructions?: string,
  documentName?: string
): Promise<EnhanceResponse> {
  const response = await fetch('/api/enhance-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      instructions,
      documentName,
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to enhance content');
  }

  return response.json();
}
