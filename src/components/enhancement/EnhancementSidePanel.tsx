import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { IconCheck, IconSparkles, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { enhanceContent } from '@/lib/api-client';
import { notifications } from '@mantine/notifications';
import type { DocumentMetadata } from '@/lib/storage';

interface Enhancement {
  enhancedHtml: string; // Enhanced HTML from API
  prompt?: string;
}

interface EnhancementSidePanelProps {
  fullDocument: string;
  paragraphWithSelection: string;
  selectedText: string;
  documentName?: string;
  documentMetadata?: DocumentMetadata;
  onClose: () => void;
  onAccept: (originalText: string, enhancedText: string) => void;
  onReject: () => void;
}

export function EnhancementSidePanel({
  fullDocument,
  paragraphWithSelection,
  selectedText,
  documentName,
  documentMetadata,
  onClose,
  onAccept,
  onReject,
}: EnhancementSidePanelProps) {
  const [prompt, setPrompt] = useState('');
  const [enhancement, setEnhancement] = useState<Enhancement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'ai'; content: string }>
  >([]);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);

    // Add user message to history
    setConversationHistory((prev) => [...prev, { role: 'user', content: prompt }]);

    try {
      const result = await enhanceContent({
        fullDocumentHtml: fullDocument,
        targetBlockHtml: paragraphWithSelection,
        instructions: prompt,
        documentName,
        metadata: documentMetadata,
      });

      // Add AI response to history
      setConversationHistory((prev) => [
        ...prev,
        { role: 'ai', content: "Here's the enhanced version:" },
      ]);

      setEnhancement({
        enhancedHtml: result.newHtml,
        prompt,
      });

      setPrompt('');
    } catch (error) {
      console.error('Enhancement failed:', error);
      notifications.show({
        title: 'Enhancement Failed',
        message: error instanceof Error ? error.message : 'Failed to enhance content',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (enhancement) {
      onAccept(selectedText, enhancement.enhancedHtml);
      onClose();
    }
  };

  const handleFollowUp = () => {
    if (!enhancement) return;
    // Reset enhancement to allow follow-up with new prompt
    setEnhancement(null);
  };

  return (
    <Stack h="100%" gap="md" p="md" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <Group justify="space-between">
        <Group gap="xs">
          <IconSparkles size={20} />
          <Text fw={600} size="lg">
            Enhance Text
          </Text>
        </Group>
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <Divider />

      {/* Selected Text Preview */}
      <Paper p="sm" withBorder bg="gray.0">
        <Text size="xs" c="dimmed" mb="xs">
          Selected text:
        </Text>
        <Text size="sm" lineClamp={3} style={{ fontStyle: 'italic' }}>
          "{selectedText}"
        </Text>
      </Paper>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <ScrollArea style={{ flex: 1 }} type="auto">
          <Stack gap="sm">
            {conversationHistory.map((message, index) => {
              const isLastAIMessage =
                message.role === 'ai' && index === conversationHistory.length - 1 && enhancement;

              return (
                <Paper
                  key={index}
                  p="sm"
                  withBorder
                  bg={message.role === 'user' ? 'blue.0' : 'gray.0'}
                >
                  <Group gap="xs" mb="xs">
                    <Badge
                      size="sm"
                      color={message.role === 'user' ? 'blue' : 'gray'}
                      variant="light"
                    >
                      {message.role === 'user' ? 'You' : 'AI'}
                    </Badge>
                  </Group>
                  <Text size="sm" mb={isLastAIMessage ? 'sm' : 0}>
                    {message.content}
                  </Text>

                  {/* Diff Viewer inside AI message */}
                  {isLastAIMessage && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <ReactDiffViewer
                        oldValue={paragraphWithSelection.replace(/<target>|<\/target>/g, '')}
                        newValue={enhancement.enhancedHtml}
                        splitView={false}
                        useDarkTheme={false}
                        hideLineNumbers
                        showDiffOnly={false}
                        styles={{
                          diffContainer: {
                            fontSize: '13px',
                          },
                        }}
                      />
                    </div>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </ScrollArea>
      )}

      {/* Loading State */}
      {isLoading && (
        <Paper p="md" withBorder>
          <Stack align="center" gap="md">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              Processing your request...
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Input Area */}
      {!enhancement && !isLoading && (
        <>
          <Textarea
            label="Custom prompt or question"
            placeholder="E.g., Make this more professional, Simplify this, Explain what this means..."
            minRows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleEnhance();
              }
            }}
          />
          <Button
            leftSection={<IconSparkles size={16} />}
            onClick={handleEnhance}
            disabled={!prompt.trim() || isLoading}
            fullWidth
          >
            Enhance
          </Button>
        </>
      )}

      {/* Action Buttons (when enhancement is ready) */}
      {enhancement && !isLoading && (
        <Group gap="sm">
          <Button
            flex={1}
            leftSection={<IconCheck size={16} />}
            color="green"
            onClick={handleAccept}
          >
            Accept
          </Button>
          <Button
            flex={1}
            leftSection={<IconX size={16} />}
            variant="light"
            color="red"
            onClick={onReject}
          >
            Reject
          </Button>
        </Group>
      )}

      {/* Follow-up Button */}
      {enhancement && !isLoading && (
        <Button variant="subtle" size="sm" onClick={handleFollowUp}>
          Ask follow-up question
        </Button>
      )}
    </Stack>
  );
}
