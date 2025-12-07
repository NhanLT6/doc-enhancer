/**
 * Content format converters for Doc Enhancer
 * Handles conversion between Markdown, HTML, and Tiptap JSON
 */

import { marked } from 'marked';
import { generateJSON, generateHTML } from '@tiptap/react';
import { getTiptapExtensions } from './tiptap-config';
import type { DocumentImage } from './storage';

/**
 * Configure marked for GFM (GitHub Flavored Markdown)
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Convert markdown string to HTML
 */
export function markdownToHtml(markdown: string, images?: DocumentImage[]): string {
  // Convert markdown to HTML using marked
  let html = marked.parse(markdown) as string;

  // If images provided, replace {{IMAGE_N}} placeholders with img tags
  if (images && images.length > 0) {
    images.forEach((image, index) => {
      const placeholder = `{{IMAGE_${index}}}`;
      const imgTag = `<img src="${image.data}" alt="${image.alt}" width="${image.width}" height="${image.height}" />`;
      html = html.replace(new RegExp(placeholder, 'g'), imgTag);
    });
  }

  return html;
}

/**
 * Convert plain text to HTML
 * Each line becomes a paragraph
 */
export function plainTextToHtml(text: string): string {
  const lines = text.split('\n');
  const paragraphs = lines.map((line) => {
    const trimmed = line.trim();
    return trimmed ? `<p>${trimmed}</p>` : '<p></p>';
  });
  return paragraphs.join('\n');
}

/**
 * Convert markdown string to Tiptap JSON
 * Optionally embed images from DocumentImage array
 */
export function markdownToTiptapJson(
  markdown: string,
  images?: DocumentImage[]
): any {
  // First, convert markdown to HTML
  let html = marked.parse(markdown) as string;

  // If images provided, replace {{IMAGE_N}} placeholders with img tags
  if (images && images.length > 0) {
    images.forEach((image, index) => {
      const placeholder = `{{IMAGE_${index}}}`;
      const imgTag = `<img src="${image.data}" alt="${image.alt}" />`;
      html = html.replace(new RegExp(placeholder, 'g'), imgTag);
    });
  }

  // Convert HTML to Tiptap JSON using configured extensions
  const json = generateJSON(html, getTiptapExtensions());

  return json;
}

/**
 * Convert Tiptap JSON to HTML string
 */
export function tiptapJsonToHtml(json: any): string {
  return generateHTML(json, getTiptapExtensions());
}

/**
 * Convert HTML string to Tiptap JSON
 */
export function htmlToTiptapJson(html: string): any {
  return generateJSON(html, getTiptapExtensions());
}

/**
 * Convert Tiptap JSON to plain text (for search, preview, etc.)
 */
export function tiptapJsonToPlainText(json: any): string {
  // Recursively extract text from Tiptap JSON
  function extractText(node: any): string {
    if (!node) return '';

    // If node has text property, return it
    if (node.text) return node.text;

    // If node has content array, process children
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }

    return '';
  }

  return extractText(json);
}

/**
 * Extract all images from Tiptap JSON
 * Useful for storage optimization or separate image handling
 */
export function extractImagesFromTiptapJson(json: any): Array<{
  src: string;
  alt: string;
}> {
  const images: Array<{ src: string; alt: string }> = [];

  function traverse(node: any) {
    if (!node) return;

    // Check if this is an image node
    if (node.type === 'image' && node.attrs) {
      images.push({
        src: node.attrs.src || '',
        alt: node.attrs.alt || '',
      });
    }

    // Recursively traverse content
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }

  traverse(json);
  return images;
}

/**
 * Create empty Tiptap document JSON
 */
export function createEmptyTiptapDoc(): any {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };
}

/**
 * Create Tiptap document from plain text
 * Each line becomes a paragraph
 */
export function plainTextToTiptapJson(text: string): any {
  const lines = text.split('\n');
  const content = lines.map((line) => ({
    type: 'paragraph',
    content: line.trim()
      ? [
          {
            type: 'text',
            text: line,
          },
        ]
      : [],
  }));

  return {
    type: 'doc',
    content,
  };
}

/**
 * Sanitize Tiptap JSON (remove potentially unsafe content)
 */
export function sanitizeTiptapJson(json: any): any {
  // Basic sanitization - can be expanded as needed
  function sanitizeNode(node: any): any {
    if (!node) return node;

    // Remove script nodes or dangerous attributes
    if (node.type === 'script') {
      return null;
    }

    // Sanitize attributes (remove event handlers)
    if (node.attrs) {
      const sanitizedAttrs = { ...node.attrs };
      Object.keys(sanitizedAttrs).forEach((key) => {
        if (key.startsWith('on')) {
          delete sanitizedAttrs[key];
        }
      });
      node.attrs = sanitizedAttrs;
    }

    // Recursively sanitize content
    if (node.content && Array.isArray(node.content)) {
      node.content = node.content
        .map(sanitizeNode)
        .filter((n: any) => n !== null);
    }

    return node;
  }

  return sanitizeNode(JSON.parse(JSON.stringify(json)));
}
