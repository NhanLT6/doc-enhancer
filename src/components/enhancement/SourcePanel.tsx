import { Card, Text, Textarea, Button, Stack, Paper, Badge } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';

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

  const handleGenerate = () => {
    onGenerate(instructions);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Stack gap="md">
        <div>
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
          p="md"
          withBorder
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            maxHeight: '400px',
            overflowY: 'auto',
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

        <Textarea
          label="Enhancement Instructions (Optional)"
          placeholder="E.g., Add code examples, explain technical concepts in detail, include best practices..."
          minRows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.currentTarget.value)}
          description="Tell the AI how you want to enhance this content"
        />

        <Button
          leftSection={<IconSparkles size={18} />}
          size="md"
          fullWidth
          onClick={handleGenerate}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Enhancement'}
        </Button>
      </Stack>
    </Card>
  );
}
