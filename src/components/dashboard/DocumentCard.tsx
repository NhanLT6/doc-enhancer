import { Card, Text, Badge, Button, Group, Stack, ActionIcon, Menu } from '@mantine/core';
import {
  IconRefresh,
  IconSparkles,
  IconDotsVertical,
  IconTrash,
  IconExternalLink,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Document } from '@/lib/storage';
import { storage } from '@/lib/storage';

interface DocumentCardProps {
  document: Document;
  onEnhance: (doc: Document) => void;
  onRefresh: () => void;
}

export function DocumentCard({ document, onEnhance, onRefresh }: DocumentCardProps) {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      const success = storage.deleteDocument(document.id);

      if (success) {
        notifications.show({
          title: 'Document Deleted',
          message: `"${document.name}" has been deleted`,
          color: 'blue',
        });
        onRefresh();
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete document',
          color: 'red',
        });
      }
    }
  };

  const handleOpenConfluence = () => {
    window.open(document.confluenceUrl, '_blank');
  };

  const getStatusBadge = () => {
    if (!document.lastFetchedContent) {
      return (
        <Badge color="gray" variant="light">
          Not Fetched
        </Badge>
      );
    }
    return (
      <Badge color="green" variant="light">
        Ready
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb="xs">
              <Text fw={600} size="lg">
                {document.name}
              </Text>
              {getStatusBadge()}
            </Group>
            <Text size="sm" c="dimmed" lineClamp={1}>
              {document.confluenceUrl}
            </Text>
          </div>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconExternalLink size={16} />}
                onClick={handleOpenConfluence}
              >
                Open in Confluence
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={handleDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Created: {formatDate(document.createdAt)}
          </Text>
          {document.updatedAt !== document.createdAt && (
            <Text size="xs" c="dimmed">
              • Updated: {formatDate(document.updatedAt)}
            </Text>
          )}
        </Group>

        <Group gap="sm">
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            size="sm"
            flex={1}
            disabled
          >
            Check Changes
          </Button>
          <Button
            leftSection={<IconSparkles size={16} />}
            size="sm"
            flex={1}
            onClick={() => onEnhance(document)}
            disabled={!document.lastFetchedContent}
          >
            Enhance
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
