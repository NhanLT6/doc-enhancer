import { ActionIcon, Modal, Textarea, Button, Stack, Text, Paper, Loader, Group } from '@mantine/core';
import { IconSparkles, IconX } from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface TextSelectionActionProps {
  containerRef: React.RefObject<HTMLElement>;
}

export function TextSelectionAction({ containerRef }: TextSelectionActionProps) {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length === 0) {
        setShowButton(false);
        return;
      }

      // Check if selection is within our container
      if (containerRef.current && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isWithinContainer = containerRef.current.contains(range.commonAncestorContainer);

        if (isWithinContainer) {
          setSelectedText(text);

          // Get selection bounding rect
          const rect = range.getBoundingClientRect();

          // Position button above and to the right of selection
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });

          setShowButton(true);
        } else {
          setShowButton(false);
        }
      }
    };

    // Add selection listener
    document.addEventListener('selectionchange', handleSelectionChange);

    // Hide button on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        if (!showModal) {
          setShowButton(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef, showModal]);

  const handleAskAboutSelection = () => {
    setShowModal(true);
    setShowButton(false);
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      // Call enhance-content API with selected text as context
      const result = await fetch('/api/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: selectedText,
          instructions: question,
          documentName: 'Selected Text',
        }),
      });

      if (!result.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await result.json();
      setResponse(data.enhancedContent);
    } catch (error) {
      setResponse('Failed to get response. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setQuestion('');
    setResponse('');
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  return (
    <>
      {/* Floating Action Button */}
      {showButton && (
        <div
          ref={buttonRef}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <ActionIcon
            size="lg"
            radius="xl"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            onClick={handleAskAboutSelection}
            style={{
              boxShadow: 'var(--mantine-shadow-md)',
              cursor: 'pointer',
            }}
          >
            <IconSparkles size={18} />
          </ActionIcon>
        </div>
      )}

      {/* Question Modal */}
      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        title="Ask about selected text"
        size="lg"
        closeButtonProps={{
          icon: <IconX size={20} />,
        }}
      >
        <Stack gap="md">
          {/* Show selected text */}
          <Paper p="sm" withBorder bg="gray.0">
            <Text size="xs" c="dimmed" mb="xs">
              Selected text:
            </Text>
            <Text size="sm" style={{ fontStyle: 'italic' }}>
              "{selectedText.length > 200 ? selectedText.substring(0, 200) + '...' : selectedText}"
            </Text>
          </Paper>

          {/* Question input */}
          <Textarea
            label="Your question"
            placeholder="E.g., Explain this in simpler terms, What does this mean?, Add examples..."
            minRows={3}
            value={question}
            onChange={(e) => setQuestion(e.currentTarget.value)}
            disabled={isLoading}
          />

          {/* Response area */}
          {(isLoading || response) && (
            <Paper p="md" withBorder>
              {isLoading ? (
                <Stack align="center" gap="md">
                  <Loader size="md" />
                  <Text size="sm" c="dimmed">
                    Getting response from AI...
                  </Text>
                </Stack>
              ) : (
                <div>
                  <Text size="xs" c="dimmed" mb="sm">
                    AI Response:
                  </Text>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <Text size="sm" mb="sm">
                          {children}
                        </Text>
                      ),
                      code: ({ children }) => (
                        <code
                          style={{
                            backgroundColor: 'var(--mantine-color-gray-2)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                          }}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                </div>
              )}
            </Paper>
          )}

          {/* Actions */}
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={handleCloseModal} disabled={isLoading}>
              Close
            </Button>
            <Button
              leftSection={<IconSparkles size={16} />}
              onClick={handleSubmitQuestion}
              loading={isLoading}
              disabled={!question.trim() || isLoading}
            >
              Ask AI
            </Button>
          </Group>
        </Stack>
      </Modal>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
      `}</style>
    </>
  );
}
