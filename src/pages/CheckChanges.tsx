/**
 * Page for checking and reviewing changes from Confluence
 */

import { useState } from 'react';
import { Container, Stack, Button, Group, Alert, Center, Text } from '@mantine/core';
import { IconAlertCircle, IconSparkles, IconX } from '@tabler/icons-react';
import { DiffViewer } from '@/components/changes/DiffViewer';
import type { Document } from '@/lib/storage';

interface CheckChangesProps {
  document: Document;
  newContent: string; // Latest content fetched from Confluence
  onProceedToEnhance: () => void;
  onCancel: () => void;
}

export function CheckChanges({
  document,
  newContent,
  onProceedToEnhance,
  onCancel,
}: CheckChangesProps) {
  const [viewMode] = useState<'diff' | 'new'>('diff');

  const hasChanges = document.lastFetchedContent !== newContent;
  const oldContent = document.lastFetchedContent || '';

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Alert for no changes */}
        {!hasChanges && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="No Changes Detected"
            color="green"
            variant="light"
          >
            The content in Confluence matches your last fetched version. There are no new changes to
            review.
          </Alert>
        )}

        {/* Diff Viewer */}
        {viewMode === 'diff' && (
          <DiffViewer
            oldContent={oldContent}
            newContent={newContent}
            oldTitle="Your Last Version"
            newTitle="Latest from Confluence"
          />
        )}

        {/* No content case */}
        {!oldContent && !newContent && (
          <Center py={80}>
            <Stack align="center" gap="md">
              <IconAlertCircle size={64} color="var(--mantine-color-gray-5)" />
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={500} mb="xs">
                  No Content Available
                </Text>
                <Text size="sm" c="dimmed">
                  Fetch content from Confluence to continue
                </Text>
              </div>
            </Stack>
          </Center>
        )}

        {/* Actions */}
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconX size={16} />} onClick={onCancel}>
            Cancel
          </Button>

          <Button
            leftSection={<IconSparkles size={16} />}
            onClick={onProceedToEnhance}
            disabled={!newContent}
          >
            {hasChanges ? 'Proceed to Enhance Changes' : 'Enhance Anyway'}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
