import { Card, Text, Textarea, Button, Stack, Paper, Badge } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { TextSelectionAction } from './TextSelectionAction';

interface SourcePanelProps {
  sourceContent: string;
  documentName: string;
  onGenerate: (instructions: string) => void;
  isLoading: boolean;
}

export function SourcePanel({
  sourceContent,
  documentName,
  onGenerate,
  isLoading,
}: SourcePanelProps) {
  const [instructions, setInstructions] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    onGenerate(instructions);
  };

  return (
    <>
      <TextSelectionAction containerRef={contentRef} />
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%" w="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Stack gap="md" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flexShrink: 0 }}>
          <Text size="lg" fw={700}>
            Source Changes
          </Text>
          <Text size="sm" c="dimmed">
            {documentName}
          </Text>
          <Badge color="blue" variant="light" mt="xs">
            From Confluence
          </Badge>
        </div>

        <Paper
          ref={contentRef}
          p="md"
          withBorder
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <Text
            size="sm"
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              lineHeight: 1.6,
            }}
          >
            {sourceContent}
          </Text>
        </Paper>

        <div style={{ flexShrink: 0 }}>
          <Textarea
            label="Enhancement Instructions (Optional)"
            placeholder="E.g., Add code examples, explain technical concepts in detail, include best practices..."
            minRows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.currentTarget.value)}
            description="Tell the AI how you want to enhance this content"
          />
        </div>

        <Button
          leftSection={<IconSparkles size={18} />}
          size="md"
          fullWidth
          onClick={handleGenerate}
          loading={isLoading}
          disabled={isLoading}
          style={{ flexShrink: 0 }}
        >
          {isLoading ? 'Generating...' : 'Generate Enhancement'}
        </Button>
      </Stack>
    </Card>
    </>
  );
}
