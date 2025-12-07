/**
 * Helper functions for working with Tiptap editor
 */

import type { Editor } from '@tiptap/react';
import { tiptapJsonToHtml } from './content-converters';

/**
 * Extract selection context from Tiptap editor
 * Returns the parent node HTML with <target> tags around selection
 */
export function extractSelectionContext(editor: Editor): {
  selectedText: string;
  parentNodeHtml: string;
  from: number;
  to: number;
} | null {
  const { from, to, empty } = editor.state.selection;

  if (empty) {
    return null;
  }

  // Get selected text
  const selectedText = editor.state.doc.textBetween(from, to);

  // Get the resolved position to find parent node
  const resolvedFrom = editor.state.selection.$from;
  const parentNode = resolvedFrom.parent;

  // Serialize parent node to HTML (without using editor.getHTML which gets full doc)
  const tempDoc = {
    type: 'doc',
    content: [parentNode.toJSON()],
  };
  const parentNodeHtml = tiptapJsonToHtml(tempDoc);

  // Inject <target> tags around the selected text in HTML
  // This is a simplified approach that works for plain text selections
  // For complex HTML selections, we'd need more sophisticated logic
  const htmlWithTarget = parentNodeHtml.replace(
    selectedText,
    `<target>${selectedText}</target>`
  );

  return {
    selectedText,
    parentNodeHtml: htmlWithTarget,
    from,
    to,
  };
}

/**
 * Replace content in editor at specific range with HTML
 */
export function replaceContentAt(
  editor: Editor,
  from: number,
  to: number,
  newHtml: string
): boolean {
  try {
    editor
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContentAt(from, newHtml)
      .run();
    return true;
  } catch (error) {
    console.error('Failed to replace content:', error);
    return false;
  }
}

/**
 * Get full document HTML from editor
 */
export function getDocumentHtml(editor: Editor): string {
  return editor.getHTML();
}

/**
 * Check if editor has selection
 */
export function hasSelection(editor: Editor): boolean {
  return !editor.state.selection.empty;
}
