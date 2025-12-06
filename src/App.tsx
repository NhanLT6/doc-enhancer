import {
  ActionIcon,
  Anchor,
  AppShell,
  Breadcrumbs,
  Container,
  Group,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconHome, IconSettings, IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import { EnhancementLayout } from './components/enhancement/EnhancementLayout';
import { mockSourceContent } from './lib/mockData';
import type { Document } from './lib/storage';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';

type Page = 'dashboard' | 'enhance' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [sidePanelOpened, setSidePanelOpened] = useState(false);

  const handleEnhance = (doc: Document) => {
    setSelectedDocument(doc);
    setCurrentPage('enhance');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedDocument(null);
  };

  const handleOpenSettings = () => {
    setCurrentPage('settings');
  };

  const getBreadcrumbs = () => {
    if (currentPage === 'dashboard') {
      return [{ title: 'Documents', href: '#' }];
    }
    if (currentPage === 'settings') {
      return [{ title: 'Settings', href: '#' }];
    }
    return [
      { title: 'Documents', href: '#', onClick: handleBackToDashboard },
      { title: selectedDocument?.name || 'Enhancement', href: '#' },
    ];
  };

  return (
    <AppShell
      header={{ height: 70 }}
      padding={0}
      aside={{
        width: 600,
        breakpoint: 'md',
        collapsed: { mobile: !sidePanelOpened, desktop: !sidePanelOpened },
      }}
    >
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
            <Group gap="xs">
              {currentPage !== 'dashboard' && (
                <Tooltip label="Home">
                  <ActionIcon variant="subtle" onClick={handleBackToDashboard}>
                    <IconHome size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Settings">
                <ActionIcon variant="subtle" onClick={handleOpenSettings}>
                  <IconSettings size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main style={{ height: 'calc(100vh)' }}>
        {currentPage === 'dashboard' && (
          <div style={{ height: '100%', padding: 'var(--mantine-spacing-md)', overflow: 'auto' }}>
            <Dashboard onEnhance={handleEnhance} />
          </div>
        )}

        {currentPage === 'settings' && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <Settings />
          </div>
        )}

        {currentPage === 'enhance' && selectedDocument && (
          <Container size="xl" h="100%" p="md" style={{ display: 'flex', flexDirection: 'column' }}>
            <EnhancementLayout
              sourceContent={selectedDocument.lastFetchedContent || mockSourceContent}
              images={selectedDocument.images}
              documentName={selectedDocument.name}
              onOpenSidePanel={() => setSidePanelOpened(true)}
              onCloseSidePanel={() => setSidePanelOpened(false)}
            />
          </Container>
        )}
      </AppShell.Main>

      {/* Side Panel for Enhancement */}
      {currentPage === 'enhance' && (
        <AppShell.Aside p={0} data-aside="enhancement">
          {/* Side panel content will be rendered by EnhancementLayout via portal */}
        </AppShell.Aside>
      )}
    </AppShell>
  );
}

export default App;
