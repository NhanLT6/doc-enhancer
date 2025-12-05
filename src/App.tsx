import { AppShell, Container, Title, Text, Group, Badge } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { EnhancementLayout } from './components/enhancement/EnhancementLayout';
import { mockDocument, mockSourceContent, mockEnhancedContent } from './lib/mockData';

function App() {
  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" px="md">
            <Group>
              <IconSparkles size={28} color="var(--mantine-color-blue-6)" />
              <div>
                <Title order={2} size="h3">
                  Doc Enhancer
                </Title>
                <Text size="xs" c="dimmed">
                  AI-powered documentation enhancement
                </Text>
              </div>
            </Group>
            <Badge color="blue" variant="light" size="lg">
              Mock Data Demo
            </Badge>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <EnhancementLayout
            sourceContent={mockSourceContent}
            documentName={mockDocument.name}
            mockEnhancedContent={mockEnhancedContent}
          />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
