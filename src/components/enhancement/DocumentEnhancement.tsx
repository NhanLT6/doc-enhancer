/**
 * Document Enhancement Component
 * Merged component that combines EnhancementLayout and InlineEnhancementDoc
 * Uses Tiptap editor with custom floating menu for text enhancement
 */

import { Paper, Stack, Text, Badge, Button, Group } from '@mantine/core';
import { useState, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { useEditor, EditorContent } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { IconSparkles, IconEdit } from '@tabler/icons-react';

import { getTiptapExtensions } from '@/lib/tiptap-config';
import { extractSelectionContext, hasSelection } from '@/lib/tiptap-helpers';
import { enhanceContent } from '@/lib/api-client';
import { EnhancementSidePanel } from './EnhancementSidePanel';
import type { DocumentMetadata } from '@/lib/storage';

interface DocumentEnhancementProps {
  contentJson: any; // Tiptap JSON content
  documentName: string;
  documentMetadata?: DocumentMetadata; // AI-generated metadata for context-aware enhancements
  onOpenSidePanel: () => void;
  onCloseSidePanel: () => void;
}

export function DocumentEnhancement({
  contentJson,
  documentName,
  documentMetadata,
  onOpenSidePanel,
  onCloseSidePanel,
}: DocumentEnhancementProps) {
  // Use Tiptap JSON directly
  const initialContent = contentJson;

  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectionContext, setSelectionContext] = useState<{
    selectedText: string;
    parentNodeHtml: string;
    from: number;
    to: number;
  } | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const asideRef = useRef<HTMLElement | null>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content: initialContent,
    editable: true,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        style: `
          outline: none;
          min-height: 400px;
          padding: 1rem;
          line-height: 1.8;
        `,
      },
    },
    onUpdate: ({ editor }) => {
      // Persist changes (you can add autosave here)
      console.log('Document updated:', editor.getJSON());
    },
  });

  // Find the AppShell.Aside element for side panel
  useEffect(() => {
    const aside = document.querySelector('[data-aside]') as HTMLElement;
    asideRef.current = aside;
  }, []);

  // Handle text selection to show/hide floating menu
  useEffect(() => {
    if (!editor) return;

    const updateFloatingMenu = () => {
      const { from, to, empty } = editor.state.selection;

      if (empty || !hasSelection(editor)) {
        setShowFloatingMenu(false);
        return;
      }

      // Get selection coordinates
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Calculate menu position (centered above selection)
      const menuTop = start.top - 60; // Position above selection
      const menuLeft = (start.left + end.right) / 2;

      setMenuPosition({ top: menuTop, left: menuLeft });
      setShowFloatingMenu(true);
    };

    // Listen to selection updates
    editor.on('selectionUpdate', updateFloatingMenu);
    editor.on('update', updateFloatingMenu);

    return () => {
      editor.off('selectionUpdate', updateFloatingMenu);
      editor.off('update', updateFloatingMenu);
    };
  }, [editor]);

  /**
   * Handle auto-enhancement (quick enhance without custom instructions)
   */
  const handleAutoEnhance = async () => {
    if (!editor) return;

    setEnhancing(true);

    try {
      // Extract selection context
      const context = extractSelectionContext(editor);
      if (!context) {
        throw new Error('No text selected');
      }

      // Get full document HTML for context
      const fullDocumentHtml = editor.getHTML();

      console.log('Auto-enhancing:', {
        selectedText: context.selectedText,
        parentNodeHtml: context.parentNodeHtml,
      });

      // Call enhancement API with metadata for context-aware enhancement
      const result = await enhanceContent({
        fullDocumentHtml,
        targetBlockHtml: context.parentNodeHtml,
        documentName,
        metadata: documentMetadata,
      });

      // Replace the parent node with enhanced HTML
      // Note: We need to replace the entire parent node since the API returns full node HTML
      const { from, to } = context;

      // Delete current parent node and insert enhanced one
      editor.chain().focus().deleteRange({ from: from - context.selectedText.length, to }).insertContentAt(from - context.selectedText.length, result.newHtml).run();

      notifications.show({
        title: 'Text Enhanced',
        message: 'The selected text has been enhanced.',
        color: 'green',
      });

      // Clear selection
      editor.commands.blur();
    } catch (error) {
      console.error('Auto enhancement failed:', error);
      notifications.show({
        title: 'Enhancement Failed',
        message: error instanceof Error ? error.message : 'Failed to enhance content',
        color: 'red',
      });
    } finally {
      setEnhancing(false);
    }
  };

  /**
   * Handle custom enhancement (with user instructions)
   */
  const handleCustomEnhance = () => {
    if (!editor) return;

    // Extract selection context
    const context = extractSelectionContext(editor);
    if (!context) {
      notifications.show({
        title: 'No Selection',
        message: 'Please select some text first',
        color: 'yellow',
      });
      return;
    }

    // Store context and open side panel
    setSelectionContext(context);
    setShowSidePanel(true);
    onOpenSidePanel();
  };

  /**
   * Handle accepting custom enhancement from side panel
   */
  const handleAcceptEnhancement = (_originalText: string, enhancedText: string) => {
    if (!editor || !selectionContext) return;

    try {
      // Replace content in editor
      const { from, to } = selectionContext;
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, enhancedText).run();

      notifications.show({
        title: 'Enhancement Applied',
        message: 'The custom enhancement has been applied.',
        color: 'green',
      });

      // Close side panel
      handleCloseSidePanel();
    } catch (error) {
      console.error('Failed to apply enhancement:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to apply enhancement',
        color: 'red',
      });
    }
  };

  /**
   * Handle rejecting custom enhancement
   */
  const handleRejectEnhancement = () => {
    notifications.show({
      title: 'Enhancement Rejected',
      message: 'The original text remains unchanged',
      color: 'blue',
    });
    handleCloseSidePanel();
  };

  /**
   * Close side panel and clear state
   */
  const handleCloseSidePanel = () => {
    setShowSidePanel(false);
    onCloseSidePanel();
    setSelectionContext(null);
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <>
      <Paper
        p="lg"
        withBorder
        h="100%"
        style={{
          overflow: 'auto',
          backgroundColor: 'var(--mantine-color-gray-0)',
          position: 'relative',
        }}
      >
        <Stack gap="md" h="100%">
          {/* Document Header */}
          <div>
            <Text size="xl" fw={700} mb="xs">
              {documentName}
            </Text>
            <Badge color="blue" variant="light">
              Select text to enhance
            </Badge>
          </div>

          {/* Tiptap Editor with Custom Floating Menu */}
          <div style={{ flex: 1, position: 'relative' }}>
            <EditorContent editor={editor} />

            {/* Custom Floating Menu for Enhancement */}
            {showFloatingMenu && (
              <div
                style={{
                  position: 'fixed',
                  top: menuPosition.top,
                  left: menuPosition.left,
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  pointerEvents: 'auto',
                }}
              >
                <Group
                  gap="xs"
                  style={{
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  <Button
                    size="xs"
                    variant="filled"
                    color="blue"
                    leftSection={<IconSparkles size={14} />}
                    onClick={handleAutoEnhance}
                    loading={enhancing}
                  >
                    Auto Enhance
                  </Button>
                  <Button
                    size="xs"
                    variant="filled"
                    color="violet"
                    leftSection={<IconEdit size={14} />}
                    onClick={handleCustomEnhance}
                  >
                    Custom Enhance
                  </Button>
                </Group>
              </div>
            )}

            {/* Add Tiptap Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              /* Table styling */
              .tiptap-editor-content table {
                border-collapse: collapse;
                margin: 1rem 0;
                width: 100%;
              }

              .tiptap-editor-content td,
              .tiptap-editor-content th {
                border: 1px solid var(--mantine-color-gray-4);
                padding: 0.5rem;
                vertical-align: top;
              }

              .tiptap-editor-content th {
                background-color: var(--mantine-color-gray-1);
                font-weight: 600;
              }

              /* Image styling */
              .tiptap-editor-content img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 1rem 0;
                border: 1px solid var(--mantine-color-gray-3);
              }

              /* Link styling */
              .tiptap-editor-content a {
                color: var(--mantine-color-blue-6);
                text-decoration: underline;
                cursor: pointer;
              }

              .tiptap-editor-content a:hover {
                color: var(--mantine-color-blue-7);
              }

              /* Code block styling */
              .tiptap-editor-content pre {
                background-color: var(--mantine-color-dark-7);
                color: var(--mantine-color-gray-1);
                padding: 1rem;
                border-radius: 8px;
                font-family: monospace;
                margin: 1rem 0;
                overflow-x: auto;
              }

              /* Inline code styling */
              .tiptap-editor-content code {
                background-color: var(--mantine-color-gray-2);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.9em;
                font-family: monospace;
              }

              /* List styling */
              .tiptap-editor-content ul,
              .tiptap-editor-content ol {
                padding-left: 1.5rem;
                margin: 1rem 0;
              }

              .tiptap-editor-content li {
                margin-bottom: 0.5rem;
              }

              /* Heading styling */
              .tiptap-editor-content h1 {
                font-size: 2rem;
                font-weight: 700;
                margin: 1.5rem 0 1rem;
              }

              .tiptap-editor-content h2 {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 1.25rem 0 0.75rem;
              }

              .tiptap-editor-content h3 {
                font-size: 1.25rem;
                font-weight: 600;
                margin: 1rem 0 0.5rem;
              }

              /* Paragraph spacing */
              .tiptap-editor-content p {
                margin-bottom: 1rem;
              }

              /* Focus styling */
              .tiptap-editor-content:focus {
                outline: none;
              }
            ` }} />
          </div>
        </Stack>
      </Paper>

      {/* Render side panel in the aside container */}
      {showSidePanel && asideRef.current && selectionContext && createPortal(
        <EnhancementSidePanel
          fullDocument={editor.getHTML()}
          paragraphWithSelection={selectionContext.parentNodeHtml}
          selectedText={selectionContext.selectedText}
          documentName={documentName}
          documentMetadata={documentMetadata}
          onClose={handleCloseSidePanel}
          onAccept={handleAcceptEnhancement}
          onReject={handleRejectEnhancement}
        />,
        asideRef.current
      )}
    </>
  );
}
