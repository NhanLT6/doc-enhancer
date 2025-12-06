import { Paper, Stack, Text, Badge, ScrollArea } from '@mantine/core';
import { useRef, useState, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FloatingEnhanceMenu } from './FloatingEnhanceMenu';
import { EnhancementSidePanel } from './EnhancementSidePanel';
import { createPortal } from 'react-dom';
import type { DocumentImage } from '@/lib/storage';
import { enhanceContent, extractParagraphWithSelection } from '@/lib/api-client';

interface InlineEnhancementDocProps {
  content: string;
  images?: DocumentImage[]; // Images extracted from PDF (if any)
  documentName: string;
  onContentChange: (newContent: string) => void;
  sidePanelContainer: HTMLElement | null;
  onOpenSidePanel: () => void;
  onCloseSidePanel: () => void;
}

export function InlineEnhancementDoc({
  content,
  images = [],
  documentName,
  onContentChange,
  sidePanelContainer,
  onOpenSidePanel,
  onCloseSidePanel,
}: InlineEnhancementDocProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [paragraphWithSelection, setParagraphWithSelection] = useState('');

  // Strip wrapping code fences if present
  const cleanContent = (rawContent: string): string => {
    let cleaned = rawContent.trim();
    // Remove wrapping code fences (```...```)
    if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    }
    // Remove <epam> or other HTML-like tags that might have been added
    cleaned = cleaned.replace(/^<\w+>\s*\n?/, '').replace(/\n?<\/\w+>$/, '');
    return cleaned.trim();
  };

  const [documentContent, setDocumentContent] = useState(cleanContent(content));

  // Convert stored images to the format expected by the component
  const processedImages = useMemo(() => {
    return images.map((img, index) => ({
      src: img.data,
      alt: img.alt,
      placeholder: `{{IMAGE_${index}}}`,
    }));
  }, [images]);

  const replaceTextInDocument = (originalText: string, newText: string) => {
    try {
      // Find and replace the original text in the document
      const fullText = documentContent;
      const selectionStart = fullText.indexOf(originalText);

      if (selectionStart !== -1) {
        const before = fullText.substring(0, selectionStart);
        const after = fullText.substring(selectionStart + originalText.length);
        const updatedContent = before + newText + after;

        setDocumentContent(updatedContent);
        onContentChange(updatedContent);

        notifications.show({
          title: 'Text Enhanced',
          message: 'The selected text has been enhanced.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Could not find the text to replace in the document',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to replace text:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to replace text',
        color: 'red',
      });
    }
  };

  const handleAutoEnhance = async (text: string, range: Range) => {
    try {
      // Get rendered text content from the container
      const fullText = contentRef.current?.innerText || '';

      // Find the selected text in the rendered content
      const textStart = fullText.indexOf(text);
      if (textStart === -1) {
        throw new Error('Selected text not found in document');
      }

      // Extract context: get surrounding paragraph
      let paragraphStart = textStart;
      let paragraphEnd = textStart + text.length;

      // Find paragraph boundaries
      while (paragraphStart > 0 && fullText[paragraphStart - 1] !== '\n') {
        paragraphStart--;
      }
      while (paragraphEnd < fullText.length && fullText[paragraphEnd] !== '\n') {
        paragraphEnd++;
      }

      const paragraph = fullText.substring(paragraphStart, paragraphEnd).trim();
      const paragraphWithSelection = paragraph.replace(
        text,
        `<target>${text}</target>`
      );

      // Call enhancement API
      const result = await enhanceContent({
        fullDocument: fullText,
        paragraphWithSelection,
        selectedText: text,
        documentName,
      });

      // Replace text in document
      replaceTextInDocument(result.originalTextToReplace, result.newText);

      // Clear selection
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('Auto enhancement failed:', error);
      notifications.show({
        title: 'Enhancement Failed',
        message: error instanceof Error ? error.message : 'Failed to enhance content',
        color: 'red',
      });
    }
  };

  const handleCustomEnhance = (text: string, range: Range) => {
    // Get rendered text content from the container
    const fullText = contentRef.current?.innerText || '';

    // Find the selected text in the rendered content
    const textStart = fullText.indexOf(text);
    if (textStart === -1) {
      console.warn('Selected text not found in document');
      setSelectedText(text);
      setParagraphWithSelection(`<target>${text}</target>`);
      setSelectedRange(range);
      setShowSidePanel(true);
      onOpenSidePanel();
      return;
    }

    // Extract context: get surrounding paragraph
    let paragraphStart = textStart;
    let paragraphEnd = textStart + text.length;

    // Find paragraph boundaries
    while (paragraphStart > 0 && fullText[paragraphStart - 1] !== '\n') {
      paragraphStart--;
    }
    while (paragraphEnd < fullText.length && fullText[paragraphEnd] !== '\n') {
      paragraphEnd++;
    }

    const paragraph = fullText.substring(paragraphStart, paragraphEnd).trim();
    const paragraphWithSelection = paragraph.replace(
      text,
      `<target>${text}</target>`
    );

    setSelectedText(text);
    setParagraphWithSelection(paragraphWithSelection);
    setSelectedRange(range);
    setShowSidePanel(true);
    onOpenSidePanel();
  };

  const handleAcceptEnhancement = (originalText: string, enhancedText: string) => {
    replaceTextInDocument(originalText, enhancedText);
    setShowSidePanel(false);
    onCloseSidePanel();
    setSelectedText('');
    setParagraphWithSelection('');
    setSelectedRange(null);
  };

  const handleRejectEnhancement = () => {
    setShowSidePanel(false);
    onCloseSidePanel();
    setSelectedText('');
    setParagraphWithSelection('');
    setSelectedRange(null);

    notifications.show({
      title: 'Enhancement Rejected',
      message: 'The original text remains unchanged',
      color: 'blue',
    });
  };

  const handleCloseSidePanel = () => {
    setShowSidePanel(false);
    onCloseSidePanel();
    setSelectedText('');
    setParagraphWithSelection('');
    setSelectedRange(null);
  };

  return (
    <>
      <FloatingEnhanceMenu
        containerRef={contentRef}
        onAutoEnhance={handleAutoEnhance}
        onCustomEnhance={handleCustomEnhance}
      />

      <Paper
        ref={contentRef}
        p="lg"
        withBorder
        h="100%"
        style={{
          overflow: 'auto',
          backgroundColor: 'var(--mantine-color-gray-0)',
        }}
      >
        <Stack gap="md">
          <div>
            <Text size="xl" fw={700} mb="xs">
              {documentName}
            </Text>
            <Badge color="blue" variant="light">
              Select text to enhance
            </Badge>
          </div>

          <div style={{ lineHeight: 1.8 }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <Text size="xl" fw={700} mb="md" mt="lg">
                    {children}
                  </Text>
                ),
                h2: ({ children }) => (
                  <Text size="lg" fw={600} mb="sm" mt="md">
                    {children}
                  </Text>
                ),
                h3: ({ children }) => (
                  <Text size="md" fw={600} mb="xs" mt="sm">
                    {children}
                  </Text>
                ),
                p: ({ children }) => {
                  // Check if this paragraph contains an image placeholder
                  const text = String(children);
                  const placeholderMatch = text.match(/\{\{IMAGE_(\d+)\}\}/);

                  if (placeholderMatch) {
                    const imageIndex = parseInt(placeholderMatch[1], 10);
                    const image = processedImages[imageIndex];

                    if (image) {
                      return (
                        <img
                          src={image.src}
                          alt={image.alt}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--mantine-color-gray-3)',
                          }}
                        />
                      );
                    }
                  }

                  return (
                    <Text size="sm" mb="md" style={{ lineHeight: 1.8 }}>
                      {children}
                    </Text>
                  );
                },
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-3)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'monospace',
                      }}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre
                      style={{
                        backgroundColor: 'var(--mantine-color-dark-7)',
                        color: 'var(--mantine-color-gray-1)',
                        padding: '1rem',
                        borderRadius: '8px',
                        overflowX: 'auto',
                        marginBottom: '1rem',
                      }}
                    >
                      <code style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{children}</code>
                    </pre>
                  );
                },
                ul: ({ children }) => (
                  <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>{children}</ul>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '0.5rem' }}>{children}</li>
                ),
              }}
            >
              {documentContent}
            </ReactMarkdown>
          </div>
        </Stack>
      </Paper>

      {/* Render side panel in the aside container */}
      {showSidePanel && sidePanelContainer && createPortal(
        <EnhancementSidePanel
          fullDocument={documentContent}
          paragraphWithSelection={paragraphWithSelection}
          selectedText={selectedText}
          documentName={documentName}
          onClose={handleCloseSidePanel}
          onAccept={handleAcceptEnhancement}
          onReject={handleRejectEnhancement}
        />,
        sidePanelContainer
      )}
    </>
  );
}
