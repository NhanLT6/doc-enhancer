import { Card, Text, Button, Stack, Paper, Badge, Center } from '@mantine/core';
import { IconDownload, IconSparkles } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';

interface PreviewPanelProps {
  enhancedContent: string | null;
  documentName: string;
  onDownload: () => void;
}

export function PreviewPanel({ enhancedContent, documentName, onDownload }: PreviewPanelProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Stack gap="md">
        <div>
          <Text size="lg" fw={700}>
            Enhanced Version
          </Text>
          <Text size="sm" c="dimmed">
            AI-enhanced documentation
          </Text>
          {enhancedContent && (
            <Badge color="green" variant="light" mt="xs">
              Ready to download
            </Badge>
          )}
        </div>

        <Paper
          p="md"
          withBorder
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            maxHeight: '500px',
            overflowY: 'auto',
          }}
        >
          {enhancedContent ? (
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <Text size="xl" fw={700} mb="sm">
                    {children}
                  </Text>
                ),
                h2: ({ children }) => (
                  <Text size="lg" fw={600} mt="lg" mb="sm">
                    {children}
                  </Text>
                ),
                h3: ({ children }) => (
                  <Text size="md" fw={600} mt="md" mb="xs">
                    {children}
                  </Text>
                ),
                p: ({ children }) => (
                  <Text size="sm" mb="sm" style={{ lineHeight: 1.6 }}>
                    {children}
                  </Text>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-2)',
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
                ol: ({ children }) => (
                  <ol style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}>{children}</li>
                ),
                blockquote: ({ children }) => (
                  <Paper
                    p="sm"
                    mb="md"
                    style={{
                      borderLeft: '4px solid var(--mantine-color-blue-5)',
                      backgroundColor: 'var(--mantine-color-blue-0)',
                    }}
                  >
                    {children}
                  </Paper>
                ),
                table: ({ children }) => (
                  <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.9em',
                      }}
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th
                    style={{
                      padding: '0.5rem',
                      borderBottom: '2px solid var(--mantine-color-gray-4)',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td
                    style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--mantine-color-gray-3)',
                    }}
                  >
                    {children}
                  </td>
                ),
              }}
            >
              {enhancedContent}
            </ReactMarkdown>
          ) : (
            <Center h={300}>
              <Stack align="center" gap="md">
                <IconSparkles size={48} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed" ta="center">
                  Click "Generate Enhancement" to see AI-enhanced content here
                </Text>
              </Stack>
            </Center>
          )}
        </Paper>

        <Button
          leftSection={<IconDownload size={18} />}
          color="green"
          size="md"
          fullWidth
          onClick={onDownload}
          disabled={!enhancedContent}
        >
          Download as .md
        </Button>
      </Stack>
    </Card>
  );
}
