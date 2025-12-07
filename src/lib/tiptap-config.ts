/**
 * Tiptap editor configuration
 * Defines extensions and provides utilities for HTML ↔ JSON conversion
 */

import { Extensions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';

/**
 * Get Tiptap extensions configured for Doc Enhancer
 */
export function getTiptapExtensions(): Extensions {
  return [
    // StarterKit includes: Bold, Italic, Strike, Code, Paragraph, Heading,
    // BulletList, OrderedList, ListItem, CodeBlock, Blockquote, HardBreak, etc.
    // Note: StarterKit does NOT include Link by default
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'code-block',
        },
      },
    }),

    // Table support
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'tiptap-table',
      },
    }),
    TableRow,
    TableCell,
    TableHeader,

    // Image support with base64 embedding
    Image.configure({
      inline: false,
      allowBase64: true, // Critical for embedded images
      HTMLAttributes: {
        class: 'tiptap-image',
      },
    }),

    // Link support
    Link.configure({
      openOnClick: false, // Don't navigate when clicking links in editor
      HTMLAttributes: {
        class: 'tiptap-link',
        rel: 'noopener noreferrer',
      },
    }),
  ];
}

/**
 * Default Tiptap editor options
 */
export const defaultEditorOptions = {
  extensions: getTiptapExtensions(),
  editorProps: {
    attributes: {
      class: 'tiptap-editor',
      style: 'outline: none; min-height: 200px; padding: 1rem;',
    },
  },
};

/**
 * Sanitize HTML for Tiptap (remove potentially unsafe attributes)
 */
export function sanitizeHtmlForTiptap(html: string): string {
  // Basic sanitization - can be expanded as needed
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

/**
 * Convert markdown image placeholders to HTML img tags
 * Example: {{IMAGE_0}} → <img src="data:image/jpeg;base64,..." />
 */
export function convertImagePlaceholdersToHtml(
  markdown: string,
  images: Array<{ data: string; alt: string }>
): string {
  let html = markdown;

  // Replace each placeholder with actual image tag
  images.forEach((image, index) => {
    const placeholder = `{{IMAGE_${index}}}`;
    const imgTag = `<img src="${image.data}" alt="${image.alt}" />`;
    html = html.replace(new RegExp(placeholder, 'g'), imgTag);
  });

  return html;
}

/**
 * Extract base64 images from HTML and return both cleaned HTML and image array
 * Useful for storage optimization (can store images separately if needed)
 */
export function extractImagesFromHtml(html: string): {
  html: string;
  images: Array<{ data: string; alt: string; placeholder: string }>;
} {
  const images: Array<{ data: string; alt: string; placeholder: string }> = [];
  let processedHtml = html;

  // Find all img tags with base64 src
  const imgRegex = /<img[^>]+src="(data:image\/[^;]+;base64,[^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi;
  let match;
  let index = 0;

  while ((match = imgRegex.exec(html)) !== null) {
    const [fullTag, dataSrc, alt] = match;
    const placeholder = `{{IMAGE_${index}}}`;

    images.push({
      data: dataSrc,
      alt: alt || `Image ${index}`,
      placeholder,
    });

    // Replace img tag with placeholder
    processedHtml = processedHtml.replace(fullTag, placeholder);
    index++;
  }

  return { html: processedHtml, images };
}
