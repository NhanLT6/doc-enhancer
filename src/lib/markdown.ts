/**
 * Markdown utilities for HTML to Markdown conversion and file downloads
 */

import TurndownService from 'turndown';

// Configure Turndown service for converting HTML to Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  bulletListMarker: '-',
});

/**
 * Convert HTML content to Markdown format
 * Uses Turndown library for conversion
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html.trim().length === 0) {
    return '';
  }

  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error('Failed to convert HTML to Markdown:', error);
    return html; // Return original if conversion fails
  }
}

/**
 * Download markdown content as a .md file
 * @param content - The markdown content to download
 * @param filename - The desired filename (without extension)
 */
export function downloadMarkdown(content: string, filename: string): void {
  // Ensure filename ends with .md
  const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`;

  // Create blob with markdown content
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename for safe download
 * Removes special characters and replaces spaces
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Download enhanced markdown with sanitized filename
 * @param content - The markdown content
 * @param documentName - The document name (will be sanitized)
 */
export function downloadEnhancedMarkdown(content: string, documentName: string): void {
  const sanitized = sanitizeFilename(documentName);
  const filename = `${sanitized}-enhanced.md`;
  downloadMarkdown(content, filename);
}

/**
 * Estimate reading time for markdown content (in minutes)
 * Assumes average reading speed of 200 words per minute
 */
export function estimateReadingTime(markdown: string): number {
  const wordsPerMinute = 200;
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Count lines in markdown content
 */
export function countLines(markdown: string): number {
  return markdown.split('\n').length;
}

/**
 * Extract headings from markdown content
 * Returns array of objects with level and text
 */
export function extractHeadings(markdown: string): Array<{ level: number; text: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
    });
  }

  return headings;
}
