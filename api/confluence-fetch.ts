/**
 * Vercel Function: Fetch content from Confluence
 * Endpoint: /api/confluence-fetch?confluenceUrl=...
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ConfluenceResponse {
  content: string; // HTML content
  title: string;
  version: number;
  lastModified: string;
}

/**
 * Extract page ID from Confluence URL
 * Supports formats:
 * - https://domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title
 * - https://domain.confluence.com/pages/123456
 */
function extractPageId(url: string): string | null {
  try {
    // Match pattern: /pages/{pageId}/
    const match = url.match(/\/pages\/(\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Failed to extract page ID:', error);
    return null;
  }
}

/**
 * Extract base URL from Confluence URL
 */
function extractBaseUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (error) {
    console.error('Failed to extract base URL:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { confluenceUrl } = req.query;

  // Validate input
  if (!confluenceUrl || typeof confluenceUrl !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid confluenceUrl parameter',
    });
  }

  // Extract page ID from URL
  const pageId = extractPageId(confluenceUrl);
  if (!pageId) {
    return res.status(400).json({
      error: 'Invalid Confluence URL format. Could not extract page ID.',
    });
  }

  // Extract base URL
  const baseUrl = extractBaseUrl(confluenceUrl);
  if (!baseUrl) {
    return res.status(400).json({
      error: 'Invalid Confluence URL format. Could not extract base URL.',
    });
  }

  // Get credentials from environment
  const confluenceToken = process.env.CONFLUENCE_TOKEN;
  const confluenceEmail = process.env.CONFLUENCE_EMAIL;

  if (!confluenceToken) {
    return res.status(500).json({
      error: 'Server configuration error: CONFLUENCE_TOKEN not set',
    });
  }

  try {
    // Fetch page content from Confluence API
    const apiUrl = `${baseUrl}/wiki/rest/api/content/${pageId}?expand=body.storage,version`;

    // Create Basic Auth header
    const auth = confluenceEmail
      ? Buffer.from(`${confluenceEmail}:${confluenceToken}`).toString('base64')
      : confluenceToken; // If no email, assume token is already formatted

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Confluence API error:', response.status, errorText);

      if (response.status === 401) {
        return res.status(401).json({
          error: 'Authentication failed. Check your Confluence credentials.',
        });
      }

      if (response.status === 404) {
        return res.status(404).json({
          error: 'Page not found. Check the Confluence URL.',
        });
      }

      return res.status(response.status).json({
        error: `Confluence API error: ${response.statusText}`,
      });
    }

    const data = await response.json();

    // Extract relevant data
    const result: ConfluenceResponse = {
      content: data.body?.storage?.value || '',
      title: data.title || 'Untitled',
      version: data.version?.number || 1,
      lastModified: data.version?.when || new Date().toISOString(),
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to fetch from Confluence:', error);
    return res.status(500).json({
      error: 'Failed to fetch from Confluence',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
