import { Modal, TextInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { storage } from '@/lib/storage';

interface AddDocumentModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDocumentModal({ opened, onClose, onSuccess }: AddDocumentModalProps) {
  const form = useForm({
    initialValues: {
      name: '',
      confluenceUrl: '',
    },
    validate: {
      name: (value) => (value.length < 1 ? 'Document name is required' : null),
      confluenceUrl: (value) => {
        if (value.length < 1) return 'Confluence URL is required';
        if (!value.startsWith('http')) return 'Must be a valid URL';
        return null;
      },
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    try {
      storage.addDocument({
        name: values.name,
        confluenceUrl: values.confluenceUrl,
        lastFetchedContent: '', // Will be fetched later
      });

      notifications.show({
        title: 'Success',
        message: 'Document added successfully',
        color: 'green',
      });

      form.reset();
      onClose();
      onSuccess();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add document',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add New Document" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Document Name"
            placeholder="e.g., API Documentation"
            required
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Confluence URL"
            placeholder="https://your-domain.atlassian.net/wiki/..."
            required
            {...form.getInputProps('confluenceUrl')}
          />
          <Button type="submit" fullWidth>
            Add Document
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
