import { useState } from 'react';
import {
  AppShell,
  Container,
  Title,
  Text,
  Group,
  ActionIcon,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { IconSparkles, IconHome } from '@tabler/icons-react';
import { EnhancementLayout } from './components/enhancement/EnhancementLayout';
import { Dashboard } from './pages/Dashboard';
import { mockSourceContent, mockEnhancedContent } from './lib/mockData';
import type { Document } from './lib/storage';

type Page = 'dashboard' | 'enhance';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleEnhance = (doc: Document) => {
    setSelectedDocument(doc);
    setCurrentPage('enhance');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedDocument(null);
  };

  const getBreadcrumbs = () => {
    if (currentPage === 'dashboard') {
      return [{ title: 'Documents', href: '#' }];
    }
    return [
      { title: 'Documents', href: '#', onClick: handleBackToDashboard },
      { title: selectedDocument?.name || 'Enhancement', href: '#' },
    ];
  };

  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" px="md">
            <Group gap="md">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={handleBackToDashboard}
                style={{ cursor: 'pointer' }}
              >
                <IconSparkles size={28} color="var(--mantine-color-blue-6)" />
              </ActionIcon>
              <div>
                <Title order={2} size="h3">
                  Doc Enhancer
                </Title>
                <Breadcrumbs separator="›" separatorMargin="xs" mt={2}>
                  {getBreadcrumbs().map((item, index) => (
                    <Anchor
                      key={index}
                      size="xs"
                      c={index === getBreadcrumbs().length - 1 ? 'dimmed' : 'blue'}
                      onClick={item.onClick}
                      style={{ cursor: item.onClick ? 'pointer' : 'default' }}
                    >
                      {item.title}
                    </Anchor>
                  ))}
                </Breadcrumbs>
              </div>
            </Group>
            {currentPage === 'dashboard' && (
              <ActionIcon variant="subtle" onClick={handleBackToDashboard}>
                <IconHome size={20} />
              </ActionIcon>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        {currentPage === 'dashboard' && <Dashboard onEnhance={handleEnhance} />}

        {currentPage === 'enhance' && selectedDocument && (
          <Container size="xl">
            <EnhancementLayout
              sourceContent={selectedDocument.lastFetchedContent || mockSourceContent}
              documentName={selectedDocument.name}
              mockEnhancedContent={mockEnhancedContent}
            />
          </Container>
        )}
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
