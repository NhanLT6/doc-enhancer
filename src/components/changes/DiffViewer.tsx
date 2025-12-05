/**
 * Side-by-side diff viewer component using react-diff-viewer-continued
 */

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Paper, Title, Text, Stack, Badge, Group } from '@mantine/core';

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  oldTitle?: string;
  newTitle?: string;
}

export function DiffViewer({
  oldContent,
  newContent,
  oldTitle = 'Previous Version',
  newTitle = 'Latest from Confluence',
}: DiffViewerProps) {
  const hasChanges = oldContent !== newContent;

  // Custom styles for the diff viewer
  const customStyles = {
    variables: {
      light: {
        diffViewerBackground: '#fff',
        diffViewerColor: '#212529',
        addedBackground: '#e6ffed',
        addedColor: '#24292e',
        removedBackground: '#ffeef0',
        removedColor: '#24292e',
        wordAddedBackground: '#acf2bd',
        wordRemovedBackground: '#fdb8c0',
        addedGutterBackground: '#cdffd8',
        removedGutterBackground: '#ffdce0',
        gutterBackground: '#f6f8fa',
        gutterBackgroundDark: '#f3f4f6',
        highlightBackground: '#fffbdd',
        highlightGutterBackground: '#fff5b1',
        codeFoldGutterBackground: '#dbedff',
        codeFoldBackground: '#f1f8ff',
        emptyLineBackground: '#fafbfc',
        gutterColor: '#212529',
        addedGutterColor: '#212529',
        removedGutterColor: '#212529',
        codeFoldContentColor: '#212529',
        diffViewerTitleBackground: '#fafbfc',
        diffViewerTitleColor: '#212529',
        diffViewerTitleBorderColor: '#eee',
      },
    },
    line: {
      padding: '10px 2px',
      fontSize: '14px',
      fontFamily: 'Monaco, Menlo, monospace',
    },
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={3} size="h4">
            Content Comparison
          </Title>
          <Text size="sm" c="dimmed">
            {hasChanges ? 'Changes detected between versions' : 'No changes detected'}
          </Text>
        </div>
        {hasChanges && (
          <Badge color="orange" variant="light" size="lg">
            Changes Found
          </Badge>
        )}
        {!hasChanges && (
          <Badge color="green" variant="light" size="lg">
            Up to Date
          </Badge>
        )}
      </Group>

      {/* Diff Viewer */}
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <ReactDiffViewer
          oldValue={oldContent}
          newValue={newContent}
          splitView={true}
          compareMethod={DiffMethod.WORDS}
          leftTitle={oldTitle}
          rightTitle={newTitle}
          styles={customStyles}
          showDiffOnly={false}
          useDarkTheme={false}
        />
      </Paper>
    </Stack>
  );
}
