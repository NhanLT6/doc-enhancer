import { Button, Center, Container, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconFileText, IconPlus } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { AddDocumentModal } from '@/components/dashboard/AddDocumentModal';
import { DocumentCard } from '@/components/dashboard/DocumentCard';
import { type Document, storage } from '@/lib/storage';

interface DashboardProps {
  onEnhance: (doc: Document) => void;
}

export function Dashboard({ onEnhance }: DashboardProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [modalOpened, setModalOpened] = useState(false);

  const loadDocuments = useCallback(() => {
    const docs = storage.getDocuments();
    setDocuments(docs);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleModalSuccess = () => {
    loadDocuments();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Documents</Title>
            <Text size="sm" c="dimmed">
              Manage your documentation from Confluence
            </Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={() => setModalOpened(true)}>
            Add Document
          </Button>
        </Group>

        {/* Storage Info */}
        {documents.length > 0 && (
          <Paper p="sm" withBorder>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {documents.length} document{documents.length !== 1 ? 's' : ''} stored locally
              </Text>
              <Text size="sm" c="dimmed">
                Storage: {storage.getStorageSize().percentage.toFixed(1)}% used
              </Text>
            </Group>
          </Paper>
        )}

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="md">
              <IconFileText size={64} color="var(--mantine-color-gray-5)" />
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" fw={500} mb="xs">
                  No documents yet
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                  Add your first document to start enhancing documentation
                </Text>
                <Button leftSection={<IconPlus size={18} />} onClick={() => setModalOpened(true)}>
                  Add Your First Document
                </Button>
              </div>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {documents.map((doc) => (
              <Grid.Col key={doc.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <DocumentCard document={doc} onEnhance={onEnhance} onRefresh={loadDocuments} />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Add Document Modal */}
      <AddDocumentModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={handleModalSuccess}
      />
    </Container>
  );
}
